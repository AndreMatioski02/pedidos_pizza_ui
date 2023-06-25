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
import styles from "./NewOrder.module.css";
import { useRouter } from "next/router";
import { OrderProductType, ProductType } from "@/types/types";
import { api } from "@/services/base";
import { formatOrderDate } from "@/utilities/formatOrderDate";

export default function NewOrder() {
  const [stepperIndex, setStepperIndex] = React.useState(0);
  const [isCreatingNewOrder, setIsCreatingNewOrder] = React.useState(true);
  const [currentSelectedProduct, setCurrentSelectedProduct] = React.useState("");
  const [availableProducts, setAvailableProducts] = React.useState<ProductType[]>([]);
  const [newOrderId, setNewOrderId] = React.useState<number | undefined>(undefined);
  const [orderProductIds, setOrderProductIds] = React.useState<string[]>([]);
  const [orderProducts, setOrderProducts] = React.useState<OrderProductType[]>([]);
  const [productAdded, setProductAdded] = React.useState(false);
  const [finalOrderValue, setFinalOrderValue] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    handleFetchAvailableProducts();
  }, []);

  React.useEffect(() => {
    handleFetchOrderProducts();
    if (newOrderId) {
      handleFetchFinalOrderPrice();
    }
  }, [productAdded]);

  const handleFetchAvailableProducts = async () => {
    await api.get("/get/products").then(res => setAvailableProducts(res.data));
  }

  const handleFetchOrderProducts = async () => {
    try {
      await api.get(`/get/order_product/${newOrderId}`).then(res => setOrderProducts(res.data));
    } catch (err) {
      setOrderProducts([]);
      console.log(err);
    }
  }

  const handleFetchFinalOrderPrice = async () => {
    await api.get(`/get/order/${newOrderId}`).then(res => setFinalOrderValue(res.data[0].total_value));
  }

  const handleAddProductToOrder = async () => {
    const productToAdd = availableProducts.find(product => product.id.toString() === currentSelectedProduct);
    setProductAdded(false);

    if (productToAdd) {
      if (orderProducts.length > 0) {
        const existingProductIndex = orderProducts.findIndex((orderProduct: OrderProductType) => orderProduct.product_id.toString() === currentSelectedProduct);
        if (existingProductIndex == -1) {
          try {
            await api.post("/create/order_product", {
              order_id: newOrderId,
              product_id: Number(currentSelectedProduct),
              quantity: 1,
              unit_price: productToAdd.price.toFixed(2)
            });
            const myOrder = await api.get(`/get/order/${newOrderId}`).then(res => res.data[0]);
            await api.put(`/update/order/${newOrderId}`, {
              client_id: myOrder.client_id,
              created_at: formatOrderDate(new Date(myOrder.created_at)),
              updated_at: formatOrderDate(new Date()),
              total_value: (myOrder.total_value + productToAdd.price).toFixed(2),
            });
          } catch (err) {
            console.log(err);
          }
        } else {
          const toUpdateProduct = orderProducts[existingProductIndex];
          try {
            await api.put(`/update/order_product/${newOrderId}/${toUpdateProduct.product_id}`, {
              order_id: newOrderId,
              product_id: Number(currentSelectedProduct),
              quantity: (toUpdateProduct.quantity + 1),
              unit_price: toUpdateProduct.unit_price.toFixed(2)
            });
            const myOrder = await api.get(`/get/order/${newOrderId}`).then(res => res.data[0]);
            await api.put(`/update/order/${newOrderId}`, {
              client_id: myOrder.client_id,
              created_at: formatOrderDate(new Date(myOrder.created_at)),
              updated_at: formatOrderDate(new Date()),
              total_value: (myOrder.total_value + productToAdd.price).toFixed(2),
            });
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        try {
          await api.post("/create/order_product", {
            order_id: newOrderId,
            product_id: Number(currentSelectedProduct),
            quantity: 1,
            unit_price: productToAdd.price.toFixed(2)
          });
          const myOrder = await api.get(`/get/order/${newOrderId}`).then(res => res.data[0]);
          await api.put(`/update/order/${newOrderId}`, {
            client_id: myOrder.client_id,
            created_at: formatOrderDate(new Date(myOrder.created_at)),
            updated_at: formatOrderDate(new Date()),
            total_value: (myOrder.total_value + productToAdd.price).toFixed(2),
          });
        } catch (err) {
          console.log(err);
        }
      }
    }
    setProductAdded(true);
  }

  const handleCreateNewOrder = async () => {
    try {
      await api.post("/create/order", {
        client_id: Number(window.sessionStorage.getItem("clientId")),
        created_at: formatOrderDate(new Date()),
        updated_at: formatOrderDate(new Date()),
        total_value: 0,
      })
        .then(res => setNewOrderId(res.data.insertId));
    } catch (err) {
      console.log(err);
    }
  }

  const handleRemoveProductFromOrder = async (toRemoveProductId: number) => {
    setProductAdded(false);
    const existingProductIndex = orderProducts.findIndex(orderProduct => orderProduct.product_id === toRemoveProductId);
    const toRemoveOrderProduct = orderProducts[existingProductIndex];
    const myOrder = await api.get(`/get/order/${newOrderId}`).then(res => res.data[0]);

    if (toRemoveOrderProduct.quantity > 1) {
      try {
        await api.put(`/update/order_product/${newOrderId}/${toRemoveOrderProduct.product_id}`, {
          order_id: newOrderId,
          product_id: Number(currentSelectedProduct),
          quantity: (toRemoveOrderProduct.quantity - 1),
          unit_price: toRemoveOrderProduct.unit_price.toFixed(2)
        });
        await api.put(`/update/order/${newOrderId}`, {
          client_id: myOrder.client_id,
          created_at: formatOrderDate(new Date(myOrder.created_at)),
          updated_at: formatOrderDate(new Date()),
          total_value: (myOrder.total_value - toRemoveOrderProduct.unit_price).toFixed(2),
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await api.delete(`/delete/order_product/${newOrderId}/${toRemoveOrderProduct.product_id}`);
        await api.put(`/update/order/${newOrderId}`, {
          client_id: myOrder.client_id,
          created_at: formatOrderDate(new Date(myOrder.created_at)),
          updated_at: formatOrderDate(new Date()),
          total_value: (myOrder.total_value - toRemoveOrderProduct.unit_price).toFixed(2),
        });
      } catch (err) {
        console.log(err);
      }
    }
    setProductAdded(true);
  }

  const handleCancelAndGoBack = async () => {
    if (orderProducts.length > 0) {
      orderProducts.forEach(async orderProduct => {
        await api.delete(`/delete/order_product/${newOrderId}/${orderProduct.product_id}`);
      });
    }

    await api.delete(`/delete/order/${newOrderId}`);
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
          <Text4 medium>Siga os passos abaixo para criar um novo pedido e adicionar produtos</Text4>
        </Box>
        <Box paddingTop={64}>
          <Stepper
            currentIndex={stepperIndex}
            steps={["Criar pedido", "Adicionar produtos"]}
          />
        </Box>
        {isCreatingNewOrder
          ?
          <Box paddingTop={64}>
            <ButtonLayout>
              <ButtonPrimary onPress={() => {
                handleCreateNewOrder();
                setStepperIndex(1);
                setIsCreatingNewOrder(false);
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
                  name="order-product-addition"
                  label="Escolha um..."
                  options={availableProducts.map(product => {
                    return {
                      text: product.name,
                      value: product.id.toString()
                    }
                  })}
                  onChangeValue={(e) => setCurrentSelectedProduct(e)}
                />
                <ButtonPrimary onPress={() => { handleAddProductToOrder() }}>
                  Adicionar produto
                </ButtonPrimary>
              </Inline>
            </Box>
            <Box paddingTop={32}>
              {orderProducts.length > 0
                &&
                <>
                  <Tag type="success">
                    Produtos
                  </Tag>
                  <RowList>
                    {orderProducts.map((orderProduct, index) => {
                      const id = orderProduct.product_id;
                      const product = availableProducts.find(availableProduct => id == availableProduct.id);
                      if (product) {
                        return (
                          <Row
                            key={index}
                            extra={
                              <Inline space="between">
                                <Stack space={0}>
                                  <Text3 medium>{product.name}</Text3>
                                  <Text3 medium color="#8F97AF">{product.description}</Text3>
                                  <Text3 medium color="#8F97AF">Quantidade: {orderProduct.quantity}</Text3>
                                </Stack>
                                <ButtonDanger onPress={() => { handleRemoveProductFromOrder(orderProduct.product_id) }}>
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
              {orderProducts.length > 0
                &&
                <Box paddingTop={24}>
                  <Tag Icon={IconCoinsRegular} type="success">
                    {`Valor total: R$${finalOrderValue.toFixed(2).toString().replace(".", ",")}`}
                  </Tag>
                </Box>
              }
            </Box>
            <Box paddingTop={80}>
              <Inline space={16}>
                <ButtonSecondary onPress={() => { handleCancelAndGoBack() }}>
                  Cancelar
                </ButtonSecondary>
                <ButtonPrimary disabled={orderProducts.length == 0} onPress={() => { router.replace("/home") }}>
                  Criar pedido
                </ButtonPrimary>
              </Inline>
            </Box>
          </Stack>
        }
      </Stack>
    </ResponsiveLayout>
  )
}
