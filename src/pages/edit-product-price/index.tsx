import * as React from "react";
import {
  Box,
  ButtonPrimary,
  ButtonSecondary,
  DecimalField,
  IconClickAndCollectRegular,
  Inline,
  ResponsiveLayout,
  Stack,
  Text3,
  Text4,
  Text8,
  alert,
} from '@telefonica/mistica'
import styles from "./EditProductPrice.module.css";
import { useRouter } from "next/router";
import { OrderProductType } from "@/types/types";
import { api } from "@/services/base";
import { formatOrderDate } from "@/utilities/formatOrderDate";

export default function EditProductPrice() {
  const [newPrice, setNewPrice] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    handleGetCurrentProductPrice();
  }, []);

  const handleGetCurrentProductPrice = async () => {
    const { orderId, productId } = router.query;
    const currentPrice = await api.get(`/get/order_product/${orderId}/${productId}`).then(res => res.data[0].unit_price);
    setNewPrice(currentPrice.toFixed(2).toString().replace(".", ","));
  }

  const handleUpdateProductPrice = async () => {
    const { orderId, productId } = router.query;
    const toUpdateOrderProduct: OrderProductType = await api.get(`/get/order_product/${orderId}/${productId}`).then(res => res.data[0]);
    const myOrder = await api.get(`/get/order/${orderId}`).then(res => res.data[0]);
    const totalValueWithoutToUpdateProduct = myOrder.total_value-(toUpdateOrderProduct.unit_price*toUpdateOrderProduct.quantity);

    try {
      await api.put(`/update/order_product/${orderId}/${productId}`, {
        order_id: orderId,
        product_id: productId,
        quantity: toUpdateOrderProduct.quantity,
        unit_price: Number(newPrice.replace(",", "."))
      });
      await api.put(`/update/order/${orderId}`, {
        client_id: myOrder.client_id,
        created_at: formatOrderDate(new Date(myOrder.created_at)),
        updated_at: formatOrderDate(new Date()),
        total_value: (totalValueWithoutToUpdateProduct+(Number(newPrice.replace(",", "."))*toUpdateOrderProduct.quantity)).toFixed(2),
      });
      alert({
        title: "Preço atualizado com sucesso!",
        message: "O preço do produto para este pedido foi atualizado e já pode ser visualizado",
        acceptText: "Ok, continuar",
        onAccept () { router.replace("/home") }
      })
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <ResponsiveLayout className={styles.main}>
      <Stack space={0}>
        <Inline space={16}>
          <IconClickAndCollectRegular size={40} />
          <Text8>Editar preço</Text8>
        </Inline>
        <Box paddingTop={8}>
          <Stack space={4}>
            <Text4 medium>Utilize o campo abaixo para alterar o preço de compra do produto selecionado</Text4>
            <Text3 medium color="#888888">O preço será alterado apenas para este pedido</Text3>
          </Stack>
        </Box>
        <Box paddingTop={64}>
          <DecimalField
            label="Novo preço"
            name="new-price-input"
            onChangeValue={setNewPrice}
            value={newPrice}
          />
        </Box>
        <Box paddingTop={80}>
          <Inline space={16}>
            <ButtonSecondary onPress={router.back}>
              Voltar
            </ButtonSecondary>
            <ButtonPrimary disabled={!newPrice} onPress={() => { handleUpdateProductPrice() }}>
              Atualizar
            </ButtonPrimary>
          </Inline>
        </Box>
      </Stack>
    </ResponsiveLayout>
  )
}