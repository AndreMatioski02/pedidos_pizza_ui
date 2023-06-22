import * as React from "react";
import {
  Box,
  ButtonDanger,
  ButtonLayout,
  ButtonPrimary,
  ButtonSecondary,
  IconCoinsRegular,
  IconShoppingCartRegular,
  Inline,
  ResponsiveLayout,
  Row,
  RowList,
  Select,
  Stack,
  Stepper,
  Tag,
  Text3,
  Text4,
  Text8,
} from '@telefonica/mistica'
import styles from "./NewCart.module.css";
import { useRouter } from "next/router";
import { CartProductType, ProductType } from "@/types/cart";
import { api } from "@/services/base";
import { formatCartDate } from "@/utilities/formatCartDate";

export default function NewCart() {
  const [stepperIndex, setStepperIndex] = React.useState(0);
  const [isCreatingNewCart, setIsCreatingNewCart] = React.useState(true);
  const [currentSelectedProduct, setCurrentSelectedProduct] = React.useState("");
  const [availableProducts, setAvailableProducts] = React.useState<ProductType[]>([]);
  const [newCartId, setNewCartId] = React.useState<number | undefined>(undefined);
  const [cartProductIds, setCartProductIds] = React.useState<string[]>([]);
  const [cartProducts, setCartProducts] = React.useState<CartProductType[]>([]);
  const [productAdded, setProductAdded] = React.useState(false);
  const [finalCartValue, setFinalCartValue] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    handleFetchAvailableProducts();
  }, []);

  React.useEffect(() => {
    handleFetchCartProducts();
    if(newCartId){
      handleFetchFinalCartPrice();
    }
  }, [productAdded]);

  const handleFetchAvailableProducts = async () => {
    await api.get("/get/products").then(res => setAvailableProducts(res.data));
  }

  const handleFetchCartProducts = async () => {
    await api.get(`/get/cart_product/${newCartId}`).then(res => setCartProducts(res.data));
  }

  const handleFetchFinalCartPrice = async () => {
    await api.get(`/get/shopping_cart/${newCartId}`).then(res => setFinalCartValue(res.data[0].total_value));
  }

  const handleAddProductToCart = async () => {
    const productToAdd = availableProducts.find(product => product.id.toString() === currentSelectedProduct);
    setProductAdded(false);

    if (productToAdd) {
      if(cartProducts.length > 0) {
        const existingProductIndex = cartProducts.findIndex((cartProduct: CartProductType) => cartProduct.product_id.toString() === currentSelectedProduct);
        if (existingProductIndex == -1) {
          try{
            await api.post("/create/cart_product", {
              shopping_cart_id: newCartId,
              product_id: Number(currentSelectedProduct),
              quantity: 1,
              created_at: formatCartDate(new Date()), 
              total_value: productToAdd.price.toFixed(2),
              product_value: productToAdd.price.toFixed(2)
            });
            const myCart = await api.get(`/get/shopping_cart/${newCartId}`).then(res => res.data[0]);
            await api.put(`/update/shopping_cart/${newCartId}`, {
              total_value: (myCart.total_value+productToAdd.price).toFixed(2),
              status: "P",
              created_at: formatCartDate(new Date(myCart.created_at)),
              updated_at: formatCartDate(new Date()),
              user_id: myCart.user_id
            });
          } catch(err) {
            console.log(err);
          }
        } else {
          const toUpdateProduct = cartProducts[existingProductIndex];
          try{
            await api.put(`/update/cart_product/${newCartId}/${toUpdateProduct.product_id}`, {
              quantity: (toUpdateProduct.quantity+1),
              created_at: formatCartDate(new Date(toUpdateProduct.created_at)),
              total_value: (toUpdateProduct.product_value*(toUpdateProduct.quantity+1)).toFixed(2),
              product_value: toUpdateProduct.product_value.toFixed(2)
            });
            const myCart = await api.get(`/get/shopping_cart/${newCartId}`).then(res => res.data[0]);
            await api.put(`/update/shopping_cart/${newCartId}`, {
              total_value: (myCart.total_value+toUpdateProduct.product_value).toFixed(2),
              status: "P",
              created_at: formatCartDate(new Date(myCart.created_at)),
              updated_at: formatCartDate(new Date()),
              user_id: myCart.user_id
            });
          } catch(err) {
            console.log(err);
          }
        }
      }else {
        try{
          await api.post("/create/cart_product", {
            shopping_cart_id: newCartId,
            product_id: Number(currentSelectedProduct),
            quantity: 1,
            created_at: formatCartDate(new Date()),
            total_value: productToAdd.price.toFixed(2),
            product_value: productToAdd.price.toFixed(2)
          });
          const myCart = await api.get(`/get/shopping_cart/${newCartId}`).then(res => res.data[0]);
          await api.put(`/update/shopping_cart/${newCartId}`, {
            total_value: (myCart.total_value+productToAdd.price).toFixed(2),
            status: "P",
            created_at: formatCartDate(new Date(myCart.created_at)),
            updated_at: formatCartDate(new Date()),
            user_id: myCart.user_id
          });
        } catch(err) {
          console.log(err);
        }
      }
    }
    setProductAdded(true);
  }

  const handleCreateNewCart = async () => {
    try {
      await api.post("/create/shopping_cart", {
        total_value: 0,
        status: "P",
        user_id: Number(window.sessionStorage.getItem("userId")),
        created_at: formatCartDate(new Date()),
        updated_at: formatCartDate(new Date())
      })
        .then(res => setNewCartId(res.data.insertId));
    } catch (err) {
      console.log(err);
    }
  }

  const handleRemoveProductFromCart = async (toRemoveProductId: string) => {
    setProductAdded(false);
    const existingProductIndex = cartProducts.findIndex(cartProduct => cartProduct.product_id === toRemoveProductId);
    const toRemoveCartProduct = cartProducts[existingProductIndex];
    const myCart = await api.get(`/get/shopping_cart/${newCartId}`).then(res => res.data[0]);

    if (toRemoveCartProduct.quantity > 1) {
      try{
        await api.put(`/update/cart_product/${newCartId}/${toRemoveCartProduct.product_id}`, {
          quantity: toRemoveCartProduct.quantity-1,
          created_at: formatCartDate(new Date(toRemoveCartProduct.created_at)),
          total_value: (toRemoveCartProduct.total_value-toRemoveCartProduct.product_value),
          product_value: toRemoveCartProduct.product_value
        });
        await api.put(`/update/shopping_cart/${newCartId}`, {
          total_value: (myCart.total_value-toRemoveCartProduct.product_value).toFixed(2),
          status: "P",
          created_at: formatCartDate(new Date(myCart.created_at)),
          updated_at: formatCartDate(new Date()),
          user_id: myCart.user_id
        });
      } catch(err) {
        console.log(err);
      }
    } else {
      try{
        await api.delete(`/delete/cart_product/${newCartId}/${toRemoveCartProduct.product_id}`);
        await api.put(`/update/shopping_cart/${newCartId}`, {
          total_value: (myCart.total_value-toRemoveCartProduct.product_value).toFixed(2),
          status: "P",
          created_at: formatCartDate(new Date(myCart.created_at)),
          updated_at: formatCartDate(new Date()),
          user_id: myCart.user_id
        });
      } catch(err) {
        console.log(err);
      }
    }
    setProductAdded(true);
  }

  const handleCancelAndGoBack = async () => {
    if(cartProducts.length > 0) {
      cartProducts.forEach(async cartProduct => {
        await api.delete(`/delete/cart_product/${newCartId}/${cartProduct.product_id}`);
      });
    }

    await api.delete(`/delete/shopping_cart/${newCartId}`);
    router.back();
  }

  return (
    <ResponsiveLayout className={styles.main}>
      <Stack space={0}>
        <Inline space={16} alignItems="center">
          <IconShoppingCartRegular size={40} /> 
          <Text8 color="white">Novo pedido</Text8>
        </Inline>
        <Box paddingTop={8}>
          <Text4 medium>Siga os passos abaixo para criar um carrinho e adicionar produtos</Text4>
        </Box>
        <Box paddingTop={64}>
          <Stepper 
            currentIndex={stepperIndex}
            steps={["Criar carrinho", "Adicionar produtos"]}
          />
        </Box>
        {isCreatingNewCart 
          ?
          <Box paddingTop={64}>
            <ButtonLayout>
              <ButtonPrimary onPress={() => {
                handleCreateNewCart();
                setStepperIndex(1);
                setIsCreatingNewCart(false);
              }}>
                Criar
              </ButtonPrimary>
            </ButtonLayout>
          </Box>
          :
          <Stack space={0}>
            <Box paddingTop={64}>
              <Inline alignItems="center" space={16}>
                <Select
                  fullWidth
                  name="cart-product-addition"
                  label="Escolha um..."
                  options={availableProducts.map(product => {
                    return {
                      text: product.name,
                      value: product.id.toString()
                    }
                  })}
                  onChangeValue={(e) => setCurrentSelectedProduct(e)}
                />
                <ButtonPrimary onPress={() => {handleAddProductToCart()}}>
                  Adicionar produto
                </ButtonPrimary>
              </Inline>
            </Box>
            <Box paddingTop={32}>
              {cartProducts.length > 0
                &&
                <>
                  <Tag type="success">
                    Produtos
                  </Tag>
                  <RowList>
                    {cartProducts.map((cartProduct, index) => {
                      const id = cartProduct.product_id;
                      const product = availableProducts.find(availableProduct => id == availableProduct.id);
                      if(product){
                        return(
                          <Row
                            key={index}
                            extra={
                              <Inline space="between">
                                <Stack space={0}>
                                  <Text3 medium>{product.name}</Text3>
                                  <Text3 medium color="#8F97AF">{product.description}</Text3>
                                  <Text3 medium color="#8F97AF">Quantidade: {cartProduct.quantity}</Text3>
                                </Stack>
                                <ButtonDanger onPress={() => { handleRemoveProductFromCart(cartProduct.product_id) }}>
                                  Remover
                                </ButtonDanger>
                              </Inline>
                            }
                          />
                        )
                      }
                    })}
                  </RowList>
                </>
              }
              {cartProducts.length > 0
                &&
                <Box paddingTop={24}>
                  <Tag Icon={IconCoinsRegular} type="success">
                    {`Valor total: R$${finalCartValue.toFixed(2).toString().replace(".", ",")}`}
                  </Tag>
                </Box>
              }
            </Box>
            <Box paddingTop={80}>
              <Inline space={16}>
                <ButtonSecondary onPress={() => { handleCancelAndGoBack() }}>
                  Cancelar
                </ButtonSecondary>
                <ButtonPrimary disabled={cartProducts.length == 0} onPress={() => { router.replace("/home") }}>
                  Criar carrinho
                </ButtonPrimary>
              </Inline>
            </Box>
          </Stack>
        }
      </Stack>
    </ResponsiveLayout>
  )
}
