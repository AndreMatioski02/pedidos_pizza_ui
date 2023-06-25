import * as React from "react";
import {
  Box,
  ButtonDanger,
  ButtonPrimary,
  IconLayersFilled,
  IconAddMoreFilled,
  IconLogoutFilled,
  IconSettingsFilled,
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
  IconShoppingCartRegular,
  IconStatusChartRegular,
  IconCoinsRegular,
  IconUserAccountRegular,
  IconChevronLeftRegular,
  IconChevronRightRegular,
} from '@telefonica/mistica'
import styles from "./Home.module.css";
import { useRouter } from "next/router";
import { OrderType, OrderProductType, ProductType } from "@/types/types";
import { api } from "@/services/base";
import { formatOrderDate } from "@/utilities/formatOrderDate";

export default function Home() {
  const [myOrders, setMyOrders] = React.useState<OrderType[]>([]);
  const [userId, setUserId] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [allOrderProducts, setAllOrderProducts] = React.useState<OrderProductType[]>([]);
  const [availableProducts, setAvailableProducts] = React.useState<ProductType[]>([]);
  const [stateChange, setStateChange] = React.useState(false);
  const [noData, setNoData] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setUserId(window.sessionStorage.getItem("userId") as string);
    setClientId(window.sessionStorage.getItem("clientId") as string);
    handleGetUserName();
  }, [userId, clientId]);

  React.useEffect(() => {
    handleGetClientOrders();
  }, [stateChange]);

  const handleGetClientOrders = async () => {
    if (clientId) {
      try {
        await api.get(`/get/order/client/${clientId}`).then(res => setMyOrders(res.data));
        await api.get(`/get/order_products`).then(res => setAllOrderProducts(res.data));
        await api.get(`/get/products`).then(res => setAvailableProducts(res.data));
      } catch (err) {
        setMyOrders([]);
        setNoData(true);
        console.log(err);
      }
    }
  }

  const handleGetUserName = async () => {
    setStateChange(true);
    if (userId) {
      try {
        await api.get(`/get/user/${userId}`).then(res => setUserName(res.data[0].username));
      } catch (err) {
        console.log(err);
      }
    }
    setStateChange(false);
  }

  const handleRemoveItemProductFromOrder = async (toRemoveProductId: number, orderId: number) => {
    const myOrder = await api.get(`/get/order_product/${orderId}`).then(res => res.data[0]);
    try {
      // await api.delete(`/delete/order_product/${orderId}/${toRemoveProductId}`);
      await api.put(`/update/order_product/${orderId}/${toRemoveProductId}`, {
        order_id: myOrder.order_id,
        product_id: myOrder.product_id,
        quantity: (myOrder.quantity - 1),
        unit_price: myOrder.unit_price.toFixed(2)
      });
    } catch (err) {
      console.log(err);
    }
    handleGetClientOrders();
  }

  const handleDeleteOrder = async (orderId: number) => {
    let myOrder: OrderProductType[] = []

    try {
      await api.get(`/get/order_product/${orderId}`).then(res => myOrder = res.data);
    } catch (err) {
      console.log(err);
    }

    if(myOrder.length > 0) {
      try {
        myOrder.forEach(async (order: OrderProductType) => {
          await api.delete(`/delete/order_product/${order.order_id}/${order.product_id}`);
        });
        await api.delete(`/delete/order/${orderId}`);
      } catch (err) {
        console.log(err);
      }
    } else {
      await api.delete(`/delete/order/${orderId}`);
    }

    handleGetClientOrders();
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
              <ButtonPrimary onPress={() => { router.push("new-order") }}>
                <IconAddMoreFilled color="white" />
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
                <IconLogoutFilled color="white" />
                <Text2 regular color="white">Logout</Text2>
              </ButtonPrimary>
              <ButtonPrimary onPress={() => {
                router.push({
                  pathname: "/edit-profile",
                  query: {
                    userId: userId
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
          {myOrders && myOrders.length > 0
            ?
            myOrders.map((order: OrderType, index: React.Key) => (
              <Box key={index} paddingBottom={64}>
                <Box className={styles.tableInfo} padding={12} paddingTop={16}>
                  <Inline space="between">
                    <Inline space={12}>
                      <Tag Icon={IconShoppingCartRegular}>
                        {`Pedido número: ${order.id}`}
                      </Tag>
                      <Tag Icon={IconCoinsRegular}>
                        {`Valor total do pedido: R$${order.total_value.toFixed(2).toString().replace(".", ",")}`}
                      </Tag>
                      <Tag Icon={IconUserAccountRegular}>
                        {`Cliente: ${userName}`}
                      </Tag>
                    </Inline>
                    <Inline space={16}>
                      <ButtonPrimary
                        className={styles.styledButton}
                        small
                        onPress={() => {
                          router.push({
                            pathname: "add-product-to-cart",
                            query: {
                              orderId: order.id
                            }
                          })
                        }}
                      >
                        Adicionar produto
                      </ButtonPrimary>
                      <ButtonDanger
                        small
                        onPress={() => confirm({
                          title: "Tem certeza que deseja excluir este pedido?",
                          message: "Esta ação não pode ser revertida (o pedido será marcado como Excluído)",
                          acceptText: "Sim, desejo excluir",
                          cancelText: "Não, voltar",
                          onAccept: () => { handleDeleteOrder(order.id) }
                        })}
                      >
                        Excluir carrinho
                      </ButtonDanger>
                    </Inline>
                  </Inline>
                </Box>
                <table cellSpacing={0} cellPadding={0} className={styles.crudTable}>
                  <thead className={styles.crudHeader}>
                    <tr>
                      <th style={{ paddingLeft: "8px" }}><Text2 medium color="white">ID</Text2></th>
                      <th><Text2 medium color="white">Nome</Text2></th>
                      <th><Text2 medium color="white">Preço unitário</Text2></th>
                      <th><Text2 medium color="white">Quantidade</Text2></th>
                      <th><Text2 medium color="white">Descrição</Text2></th>
                      <th><Text2 medium color="white"></Text2></th>
                      <th><Text2 medium color="white"></Text2></th>
                    </tr>
                  </thead>
                  <tbody className={styles.crudBody}>
                    {allOrderProducts.map((orderProduct: OrderProductType, index: number) => {
                      const isProductInOrder = order.id == orderProduct.order_id;
                      if (isProductInOrder) {
                        const product = availableProducts.find(availableProduct => availableProduct.id == orderProduct.product_id);
                        if (product) {
                          return (
                            <tr className={styles.crudRow} key={index}>
                              <td style={{ paddingLeft: "8px" }}><Text1 medium>{product.id}</Text1></td>
                              <td><Text1 medium wordBreak>{product.name}</Text1></td>
                              <td><Text1 medium>R${orderProduct.unit_price.toFixed(2).toString().replace(".", ",")}</Text1></td>
                              <td><Text1 medium >{orderProduct.quantity}</Text1></td>
                              <td style={{ width: "200px" }}><Text1 medium truncate>{product.description}</Text1></td>
                              <td>
                                <ButtonPrimary
                                  onPress={() => {
                                    router.push({
                                      pathname: "edit-product-price",
                                      query: {
                                        orderId: order.id,
                                        productId: product.id
                                      }
                                    })
                                  }}
                                  small
                                >
                                  Editar preço
                                </ButtonPrimary>
                              </td>
                              <td>
                                <ButtonDanger
                                  onPress={() => confirm({
                                    title: "Tem certeza que deseja remover um item este produto?",
                                    message: "Esta ação não pode ser revertida",
                                    acceptText: "Sim, excluir",
                                    cancelText: "Não, voltar",
                                    onAccept: () => handleRemoveItemProductFromOrder(product.id, order.id)
                                  })} small
                                >
                                  Remover item
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
