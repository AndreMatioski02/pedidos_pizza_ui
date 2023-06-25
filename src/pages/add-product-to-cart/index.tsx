import * as React from "react";
import { 
  Box,
  ButtonPrimary, 
  ButtonSecondary, 
  Inline, 
  IntegerField, 
  ResponsiveLayout, 
  Select, 
  Stack, 
  Text4,
  Text8,
  alert, 
} from '@telefonica/mistica'
import styles from "./AddProductToOrder.module.css";
import { useRouter } from "next/router";
import { api } from "@/services/base";
import { OrderProductType, ProductType, OrderType } from "@/types/types";
import { formatOrderDate } from "@/utilities/formatOrderDate";

export default function AddProductToOrder() {
  const [availableProducts, setAvailableProducts] = React.useState<ProductType[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState("");
  const [newQuantity, setNewQuantity] = React.useState("");
  const [orderProducts, setOrderProducts] = React.useState<OrderProductType[]>([]);
  const [order, setOrder] = React.useState<OrderType[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    handleGetOrder();
    handleGetProducts();
    handleFetchOrderProducts();
  }, []);

  const handleGetOrder = async () => {
    const { orderId } = router.query;
    try {
      await api.get(`/get/order/${orderId}`).then(res => setOrder(res.data));
    } catch (err) {
      console.log(err);
    }
  }
  const handleGetProducts = async () => {
    try {
      await api.get(`/get/products`).then(res => setAvailableProducts(res.data));
    } catch (err) {
      console.log(err);
    }
  }

  const handleFetchOrderProducts = async () => {
    const { orderId } = router.query;
    try {
      await api.get(`/get/order_product/${orderId}`).then(res => setOrderProducts(res.data));
    } catch(err) {
      setOrderProducts([]);
      console.log(err);
    }
  }

  const calculateTotalValue = () => {
    handleFetchOrderProducts();

    let total = 0;

    const calculate = React.useCallback(() => {
      return orderProducts.forEach(product => {
        total += product.unit_price * product.quantity
      })
    }, [orderProducts])

    return calculate;
  }

  const handleAddProductToOrder = async () => {
    const { orderId } = router.query;
    const productToAdd = availableProducts.find(availableProduct => availableProduct.id.toString() == selectedProduct);

    if(productToAdd) {
      if(orderProducts.length > 0) {
        const existingProductIndex = orderProducts.findIndex((orderProduct: OrderProductType) => orderProduct.product_id.toString() === selectedProduct);
        const myOrder = await api.get(`/get/order/${orderId}`).then(res => res.data[0]);

        if (existingProductIndex == -1) {
          try{
            await api.post("/create/order_product", {
              order_id: orderId,
              product_id: Number(selectedProduct),
              quantity: Number(newQuantity),
              unit_price: productToAdd.price,
            });
            await api.put(`/update/order/${orderId}`, {
              client_id: myOrder.client_id,
              created_at: formatOrderDate(new Date()),
              updated_at: formatOrderDate(new Date()),
              total_value: (productToAdd.price*Number(newQuantity))+Number(order[0].total_value),
            });
            alert({
              title: "Produto adicionado com sucesso!",
              message: "O novo produto poderá ser visualizado em seguida",
              acceptText: "Ok, continuar",
              onAccept() { router.replace("/home") },
            });
          } catch(err) {
            console.log(err);
          }
        }else {
          const toUpdateProduct = orderProducts[existingProductIndex];
          try{
            await api.put(`/update/order_product/${orderId}/${toUpdateProduct.product_id}`, {
              order_id: orderId,
              product_id: Number(selectedProduct),
              quantity: Number(newQuantity),
              unit_price: toUpdateProduct.unit_price,
            });
            await api.put(`/update/order/${orderId}`, {
              client_id: myOrder.client_id,
              created_at: formatOrderDate(new Date()),
              updated_at: formatOrderDate(new Date()),
              total_value: (myOrder.total_value+(toUpdateProduct.unit_price*(Number(newQuantity)-toUpdateProduct.quantity))),
            });
            alert({
              title: "Produto adicionado com sucesso!",
              message: "O novo produto poderá ser visualizado em seguida",
              acceptText: "Ok, continuar",
              onAccept() { router.replace("/home") },
            });
          } catch(err) {
            console.log(err);
          }
        }
      }
    }
  }

  return (
    <ResponsiveLayout className={styles.main}>
      <Stack space={0}>
       <Text8>Adicionar produto</Text8>
       <Box paddingTop={8}>
        <Text4 medium>Por favor, escolha um produto da lista abaixo para adicionar ao pedido</Text4>
       </Box>
       <Box paddingTop={64}>
        <Select 
          name="order-product-addition"
          label="Escolha um..."
          options={availableProducts.map(availableProduct => {
            return {
              text: availableProduct.name,
              value: availableProduct.id.toString()
            }
          })}
          onChangeValue={setSelectedProduct}
        />
       </Box>
       <Box paddingTop={24}>
        <IntegerField 
          label="Quantidade"
          name="product-quantity"
          onChangeValue={setNewQuantity}
          value={newQuantity}
        />
       </Box>
       <Box paddingTop={80}>
        <Inline space={16}>
          <ButtonSecondary onPress={router.back}>
            Voltar
          </ButtonSecondary>
          <ButtonPrimary disabled={!selectedProduct || !newQuantity} onPress={() => { handleAddProductToOrder() }}>
            Adicionar
          </ButtonPrimary>
        </Inline>
       </Box>
      </Stack>
    </ResponsiveLayout>
  )
}
