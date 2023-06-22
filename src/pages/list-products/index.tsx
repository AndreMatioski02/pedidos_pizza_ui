import * as React from "react";
import {
  Box,
  ButtonDanger,
  ButtonPrimary,
  ButtonSecondary,
  IconAppsFilled,
  IconChevronLeftRegular,
  IconLogoutRegular,
  IconSettingsRegular,
  Inline,
  ResponsiveLayout,
  Stack,
  Text1,
  Text2,
  Text8,
  confirm,
} from '@telefonica/mistica'
import styles from "./ListProducts.module.css";
import { useRouter } from "next/router";
import { ProductType } from "@/types/cart";
import { api } from "@/services/base";

export default function ListProducts() {
  const router = useRouter();
  const [storeProducts, setStoreProducts] = React.useState<ProductType[]>([]);

  React.useEffect(() => {
    handleGetProducts();
  }, []);

  const handleGetProducts = async () => {
    try {
      await api.get("/get/products").then(res => setStoreProducts(res.data));
    } catch(err) {
      console.log(err);
    }
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

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.delete(`/delete/product/${productId}`);
      handleGetProducts();
    } catch(err) {
      console.log(err);
    }
  }

  return (
    <ResponsiveLayout className={styles.main}>
      <Stack space={0}>
        <Text8><IconAppsFilled size={40} /> Catálogo de Produtos</Text8>
        <Box paddingBottom={48} paddingTop={12}>
          <Inline space="between">
            <Inline space={16}>
              <ButtonPrimary onPress={() => { router.push("/home") }}>
                <IconChevronLeftRegular />
                <Text2 regular>Voltar</Text2>
              </ButtonPrimary>
              <ButtonPrimary onPress={() => { router.push("new-product") }}>
                <Text2 regular>+ Novo Produto</Text2>
              </ButtonPrimary>
            </Inline>
            <Inline space={16}>
              <ButtonSecondary onPress={() => { router.replace("/") }}>
                <IconLogoutRegular />
                <Text2 regular>Logout</Text2>
              </ButtonSecondary>
              <ButtonSecondary onPress={() => { 
                router.push({
                  pathname: "/edit-profile",
                  query: {
                    userId: "1"
                  }
                }) 
              }}>
                <IconSettingsRegular />
                <Text2 regular>Editar Perfil</Text2>
              </ButtonSecondary>
            </Inline>
          </Inline>
        </Box>
        <Box className={styles.tablesContainer}>
          <table cellSpacing={0} cellPadding={0} className={styles.crudTable}>
            <thead className={styles.crudHeader}>
              <tr>
                <th style={{ paddingLeft: "8px" }}><Text2 medium color="white">ID</Text2></th>
                <th><Text2 medium color="white">Nome</Text2></th>
                <th><Text2 medium color="white">Marca</Text2></th>
                <th><Text2 medium color="white">Preço</Text2></th>
                <th style={{ width: "250px" }}><Text2 medium color="white">Descrição</Text2></th>
                <th><Text2 medium color="white">Validade</Text2></th>
                <th><Text2 medium color="white"></Text2></th>
                <th><Text2 medium color="white"></Text2></th>
              </tr>
            </thead>
            <tbody className={styles.crudBody}>
              {storeProducts && storeProducts.length > 0
                ?
                storeProducts.map((product: ProductType, index: React.Key) => (
                  <tr className={styles.crudRow} key={index}>
                    <td style={{ paddingLeft: "8px" }}><Text1 medium>{product.id}</Text1></td>
                    <td><Text1 medium wordBreak>{product.name}</Text1></td>
                    <td><Text1 medium wordBreak>{product.brand}</Text1></td>
                    <td><Text1 medium>R${product.price.toFixed(2).toString().replace(".", ",")}</Text1></td>
                    <td><Text1 medium truncate>{product.description}</Text1></td>
                    <td><Text1 medium>{handleFormatDate(product.expiration_date)}</Text1></td>
                    <td>
                      <ButtonSecondary
                        onPress={() => { 
                          router.push({
                            pathname: "/edit-product",
                            query: {
                              productId: product.id
                            }
                          })
                        }} 
                        small
                      >
                        Editar
                      </ButtonSecondary>
                    </td>
                    <td>
                      <ButtonDanger
                        onPress={() => confirm({
                          title: "Tem certeza que deseja excluir este produto?",
                          message: "Esta ação não pode ser revertida",
                          acceptText: "Sim, excluir",
                          cancelText: "Não, voltar",
                          onAccept: () => handleDeleteProduct(product.id)
                        })} small
                      >
                        Excluir
                      </ButtonDanger>
                    </td>
                  </tr>
                ))
                :
                <tr>
                  <td>Carregando...</td>
                </tr>
              }
            </tbody>
          </table>
        </Box>
      </Stack>
    </ResponsiveLayout>
  )
}
