import * as React from "react";
import {
  Box,
  ButtonDanger,
  ButtonPrimary,
  ButtonSecondary,
  IconLayersFilled,
  IconAddMoreFilled,
  IconCoinsRegular,
  IconLogoutFilled,
  IconSettingsFilled,
  IconShoppingCartRegular,
  IconStatusChartRegular,
  IconUserAccountRegular,
  IconAppsBusinessRegular,
  Inline,
  ResponsiveLayout,
  Stack,
  Tag,
  Text1,
  Text2,
  Text6,
  Text8,
  confirm,
} from '@telefonica/mistica'
import styles from "./Home.module.css";
import { useRouter } from "next/router";
import { CartType, CartProductType, ProductType } from "@/types/cart";
import { api } from "@/services/base";
import { formatCartDate } from "@/utilities/formatOrderDate";

export default function Home() {
  const [myCarts, setMyCarts] = React.useState<CartType[]>([]);
  const [userId, setUserId] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [allCartProducts, setAllCartProducts] = React.useState<CartProductType[]>([]);
  const [availableProducts, setAvailableProducts] = React.useState<ProductType[]>([]);
  const [stateChange, setStateChange] = React.useState(false); 
  const [noData, setNoData] = React.useState(false); 
  const router = useRouter();

  React.useEffect(() => {
    setUserId(window.sessionStorage.getItem("userId") as string);
    handleGetUserName();
  }, [userId]);

  React.useEffect(() => {
    handleGetUserCarts();
  }, [stateChange]);

  const handleGetUserCarts = async () => {
    if(userId) {
      try {
        await api.get(`/get/shopping_cart/user/${userId}`).then(res => setMyCarts(res.data));
        await api.get(`/get/cart_products`).then(res => setAllCartProducts(res.data));
        await api.get(`/get/products`).then(res => setAvailableProducts(res.data));
      } catch (err) {
        setNoData(true);
        console.log(err);
      }
    }
  }

  const handleGetUserName = async () => {
    setStateChange(true);
    if(userId){
      try {
        await api.get(`/get/user/${userId}`).then(res => setUserName(res.data[0].name));
      } catch (err) {
        console.log(err);
      }
    }
    setStateChange(false);
  }

  const handleRemoveProductFromCart = async (toRemoveProductId: string, cartId: string) => {
    const myCart = await api.get(`/get/shopping_cart/${cartId}`).then(res => res.data[0]);
    const toRemoveCartProduct = await api.get(`/get/cart_product/${cartId}/${toRemoveProductId}`).then(res => res.data[0]);;
    try{
      await api.delete(`/delete/cart_product/${cartId}/${toRemoveProductId}`);
      await api.put(`/update/shopping_cart/${cartId}`, {
        total_value: (myCart.total_value-(toRemoveCartProduct.product_value*toRemoveCartProduct.quantity)).toFixed(2),
        status: "P",
        created_at: formatCartDate(new Date(myCart.created_at)),
        updated_at: formatCartDate(new Date()),
        user_id: myCart.user_id
      });
    } catch(err) {
      console.log(err);
    }
    handleGetUserCarts();
  }

  const handleFormatDate = (date: string) => {
    const completeDate = new Date(date);
    let formattedMonth;
    let formattedDay;

    if(completeDate.getDate() > 9) {
      formattedDay = completeDate.getDate();
    }else {
      formattedDay = `0${completeDate.getDate()}`;
    }

    if(completeDate.getMonth() > 9) {
      formattedMonth = completeDate.getMonth();
    }else {
      formattedMonth = `0${completeDate.getMonth()}`;
    }

    return `${formattedDay}/${formattedMonth}/${completeDate.getFullYear()}`;
  }

  const handleUpdateCart = async (toUpdateStatus: string, cartId: string) => {
    setStateChange(true);
    const myCart = await api.get(`/get/shopping_cart/${cartId}`).then(res => res.data[0]);

    try{
      api.put(`/update/shopping_cart/${cartId}`, {
        total_value: myCart.total_value,
        status: toUpdateStatus,
        created_at: formatCartDate(new Date(myCart.created_at)),
        updated_at: formatCartDate(new Date()),
        user_id: myCart.user_id
      });
    } catch(err) {
      console.log(err);
    }
    
    setStateChange(false);
  }

  return (
    <ResponsiveLayout className={styles.main}>
      <Stack space={0}>
        <Inline space={16} alignItems="center">
          <IconLayersFilled size={40} />
          <Text8>Meus pedidos</Text8>
        </Inline>
        <Box paddingBottom={48} paddingTop={12}>
          <Inline space="between">
            <Inline space={16}>
              <ButtonPrimary onPress={() => { router.push("new-cart") }}>
                <IconAddMoreFilled color="white"/>
                <Text2 regular color="white"> Novo pedido</Text2>              
              </ButtonPrimary>
              <ButtonPrimary onPress={() => { router.push("list-products") }}>
                <IconAppsBusinessRegular color="white" />
                <Text2 regular color="white">Produtos</Text2>
              </ButtonPrimary>
            </Inline>
            <Inline space={16}>
              <ButtonPrimary onPress={() => { 
                window.sessionStorage.clear();
                router.replace("/");
              }}>
                <IconLogoutFilled color="white"/>
                <Text2 regular color="white">Logout</Text2>
              </ButtonPrimary>
              <ButtonPrimary onPress={() => { 
                router.push({
                  pathname: "/edit-profile",
                  query: {
                    userId: "1"
                  }
                }) 
              }}>
                <IconSettingsFilled color="white" />
                <Text2 regular color="white">Editar Perfil</Text2>
              </ButtonPrimary>
            </Inline>
          </Inline>
        </Box>
        <Box className={styles.tablesContainer}>
          {myCarts && myCarts.length > 0
            ?
            myCarts.map((cart: CartType, index: React.Key) => (
              <Box key={index} paddingBottom={64}>
                <Box className={styles.tableInfo} padding={12} paddingTop={16}>
                  <Inline space="between">
                    <Inline space={12}>
                      <Tag Icon={IconShoppingCartRegular} type={cart.status == "E" ? "inactive" : "warning"}>
                        {`Carrinho: ${cart.id}`}
                      </Tag>
                      {cart.status != "E"
                        ?
                        <Tag Icon={IconStatusChartRegular} type={cart.status == "P" ? "promo" : "success"}>
                          {`Status: ${cart.status === "P" ? "Pendente" : "Baixado"}`}
                        </Tag>
                        :
                        <Tag Icon={IconStatusChartRegular} type="inactive">
                          Status: Excluído
                        </Tag>
                      }
                      <Tag Icon={IconCoinsRegular} type={cart.status == "E" ? "inactive" : "warning"}>
                        {`Valor total: R$${cart.total_value.toFixed(2).toString().replace(".", ",")}`}
                      </Tag>
                      <Tag Icon={IconUserAccountRegular} type={cart.status == "E" ? "inactive" : "warning"}>
                        {`Cliente: ${userName}`}
                      </Tag>
                    </Inline>
                    <Inline space={16}>
                      <ButtonSecondary
                        disabled={cart.status !== "P"}
                        small
                        onPress={() => {
                          router.push({
                            pathname: "add-product-to-cart",
                            query: {
                              cartId: cart.id
                            }
                          })
                        }}
                      >
                        Adicionar produto
                      </ButtonSecondary>
                      <ButtonDanger
                        disabled={cart.status !== "P"}
                        small
                        onPress={() => confirm({
                          title: "Tem certeza que deseja excluir este carrinho?",
                          message: "Esta ação não pode ser revertida (o carrinho será marcado como Excluído)",
                          acceptText: "Sim, desejo excluir",
                          cancelText: "Não, voltar",
                          onAccept: () => { handleUpdateCart("E", cart.id) }
                        })}
                      >
                        Excluir carrinho
                      </ButtonDanger>
                      <ButtonPrimary
                        disabled={cart.status !== "P"}
                        small
                        onPress={() => confirm({
                          title: "Tem certeza que deseja finalizar este carrinho?",
                          message: "Esta ação não pode ser revertida (o carrinho será marcado como Baixado)",
                          acceptText: "Sim, desejo finalizar",
                          cancelText: "Não, voltar",
                          onAccept: () => { handleUpdateCart("B", cart.id) }
                        })}
                      >
                        Finalizar carrinho
                      </ButtonPrimary>
                    </Inline>
                  </Inline>
                </Box>
                <table cellSpacing={0} cellPadding={0} className={styles.crudTable}>
                  <thead className={styles.crudHeader}>
                    <tr>
                      <th style={{ paddingLeft: "8px" }}><Text2 medium color="white">ID</Text2></th>
                      <th><Text2 medium color="white">Nome</Text2></th>
                      <th><Text2 medium color="white">Marca</Text2></th>
                      <th><Text2 medium color="white">Preço</Text2></th>
                      <th><Text2 medium color="white">Quantidade</Text2></th>
                      <th><Text2 medium color="white">Validade</Text2></th>
                      <th><Text2 medium color="white">Descrição</Text2></th>
                      <th><Text2 medium color="white"></Text2></th>
                      <th><Text2 medium color="white"></Text2></th>
                    </tr>
                  </thead>
                  <tbody className={styles.crudBody}>
                    {allCartProducts.map((cartProduct: CartProductType, index: number) => {
                      const isProductInCart = cart.id == cartProduct.shopping_cart_id;
                      if(isProductInCart) {
                        const product = availableProducts.find(availableProduct => availableProduct.id == cartProduct.product_id);
                        if(product) {
                          return (
                            <tr className={styles.crudRow} key={index}>
                              <td style={{ paddingLeft: "8px" }}><Text1 medium>{product.id}</Text1></td>
                              <td><Text1 medium wordBreak>{product.name}</Text1></td>
                              <td><Text1 medium wordBreak>{product.brand}</Text1></td>
                              <td><Text1 medium>R${cartProduct.product_value.toFixed(2).toString().replace(".", ",")}</Text1></td>
                              <td><Text1 medium>{cartProduct.quantity}</Text1></td>
                              <td><Text1 medium>{handleFormatDate(product.expiration_date)}</Text1></td>
                              <td style={{ width: "200px" }}><Text1 medium truncate>{product.description}</Text1></td>
                              <td>
                                <ButtonSecondary
                                  disabled={cart.status !== "P"}
                                  onPress={() => {
                                    router.push({
                                      pathname: "edit-product-price",
                                      query: {
                                        cartId: cart.id,
                                        productId: product.id
                                      }
                                    })
                                  }}
                                  small
                                >
                                  Editar preço
                                </ButtonSecondary>
                              </td>
                              <td>
                                <ButtonDanger
                                  disabled={cart.status !== "P"}
                                  onPress={() => confirm({
                                    title: "Tem certeza que deseja excluir este produto?",
                                    message: "Esta ação não pode ser revertida",
                                    acceptText: "Sim, excluir",
                                    cancelText: "Não, voltar",
                                    onAccept: () => handleRemoveProductFromCart(product.id, cart.id)
                                  })} small
                                >
                                  Excluir
                                </ButtonDanger>
                              </td>
                            </tr>
                          )
                        }
                      }
                    })}
                  </tbody>
                </table>
              </Box>
            ))
            :
            <Box>
              <Text6>{noData ? 'Nenhum dado encontrado!' : 'Carregando...'}</Text6>
            </Box>
          }
        </Box>
      </Stack>
    </ResponsiveLayout>
  )
}
