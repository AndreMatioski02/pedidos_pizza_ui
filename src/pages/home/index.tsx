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
    if(clientId) {
      try {
        await api.get(`/get/order/client/${clientId}`).then(res => setMyOrders(res.data));
        await api.get(`/get/order_products`).then(res => setAllOrderProducts(res.data));
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

  const handleRemoveProductFromOrder = async (toRemoveProductId: number, orderId: number) => {
    const myOrder = await api.get(`/get/order_product/${orderId}`).then(res => res.data[0]);
    const toRemoveOrderProduct = await api.get(`/get/order_product/${orderId}/${toRemoveProductId}`).then(res => res.data[0]);;
    try{
      await api.delete(`/delete/order_product/${orderId}/${toRemoveProductId}`);
      await api.put(`/update/order_product/${orderId}`, {
        total_value: (myOrder.total_value-(toRemoveOrderProduct.product_value*toRemoveOrderProduct.quantity)).toFixed(2),
        status: "P",
        created_at: formatOrderDate(new Date(myOrder.created_at)),
        updated_at: formatOrderDate(new Date()),
        user_id: myOrder.user_id
      });
    } catch(err) {
      console.log(err);
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
                </Box>
                <table cellSpacing={0} cellPadding={0} className={styles.crudTable}>
                  <thead className={styles.crudHeader}>
                    <tr>
                      <th style={{ paddingLeft: "8px" }}><Text2 medium color="white">ID</Text2></th>
                      <th><Text2 medium color="white">Nome</Text2></th>
                      <th><Text2 medium color="white">Preço</Text2></th>
                      <th><Text2 medium color="white">Quantidade</Text2></th>
                      <th><Text2 medium color="white">Descrição</Text2></th>
                      <th><Text2 medium color="white"></Text2></th>
                      <th><Text2 medium color="white"></Text2></th>
                    </tr>
                  </thead>
                  <tbody className={styles.crudBody}>
                    {allOrderProducts.map((orderProduct: OrderProductType, index: number) => {
                      const isProductInOrder = order.id == orderProduct.order_id;
                      if(isProductInOrder) {
                        const product = availableProducts.find(availableProduct => availableProduct.id == orderProduct.product_id);
                        if(product) {
                          return (
                            <tr className={styles.crudRow} key={index}>
                              <td style={{ paddingLeft: "8px" }}><Text1 medium>{product.id}</Text1></td>
                              <td><Text1 medium wordBreak>{product.name}</Text1></td>
                              <td><Text1 medium>R${orderProduct.unit_price.toFixed(2).toString().replace(".", ",")}</Text1></td>
                              <td><Text1 medium>{orderProduct.quantity}</Text1></td>
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
                                    title: "Tem certeza que deseja excluir este produto?",
                                    message: "Esta ação não pode ser revertida",
                                    acceptText: "Sim, excluir",
                                    cancelText: "Não, voltar",
                                    onAccept: () => handleRemoveProductFromOrder(product.id, order.id)
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
