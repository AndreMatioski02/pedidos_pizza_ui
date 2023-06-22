import * as React from "react";
import {
  Box,
  ButtonPrimary,
  ButtonSecondary,
  DateField,
  DecimalField,
  IconClickAndCollectRegular,
  Inline,
  ResponsiveLayout,
  Stack,
  Text4,
  Text8,
  TextField,
  alert,
} from '@telefonica/mistica'
import styles from "./EditProduct.module.css";
import { useRouter } from "next/router";
import { api } from "@/services/base";

export default function EditProduct() {
  const [name, setName] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [expirationDate, setExpirationDate] = React.useState("");
  const router = useRouter();
  const toEditProductId = router.query.productId;

  const validateFields = () => {
    if(
      name.length < 2 ||
      brand.length < 2 ||
      description.length < 10 ||
      Number(price.replace(",", ".")) <= 0.01 ||
      expirationDate.length < 10
    ){
      return true;
    }else {
      return false;
    }
  }

  const handleEditProduct = async () => {
    try {
      await api.put(`/update/product/${toEditProductId}`, {
        name,
        brand,
        price: Number(price.replace(",", ".")),
        expiration_date: expirationDate,
        description
      });
      alert({
        title: "Produto atualizado com sucesso!",
        message: "Você será redirecionado para o catálogo atualizado",
        acceptText: "Ok, continuar",
        onAccept() { router.replace("/list-products") },
      });
    } catch (err) {
      console.log(err);
      alert({
        title: "Algo deu errado por aqui",
        message: "Parece que algo deu errado ao atualizar o produto! Por favor, tente novamente",
        acceptText: "Fechar",
        onAccept() { router.replace("/list-products") },
      })
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

    return `${completeDate.getFullYear()}-${formattedMonth}-${formattedDay}`;
  }

  const handleGetProductInfo = async () => {
    try {
      await api.get(`/get/product/${toEditProductId}`).then(res => {
        setName(res.data[0].name);
        setBrand(res.data[0].brand);
        setDescription(res.data[0].description);
        setPrice(res.data[0].price.toString());
        setExpirationDate(handleFormatDate(res.data[0].expiration_date));
      })
    } catch(err) {
      console.log(err);
      alert({
        title: "Algo deu errado por aqui",
        message: "Parece que algo deu errado com este produto! Por favor, tente novamente",
        acceptText: "Fechar",
        onAccept() { router.replace("/list-products") },
      })
    }
  }

  React.useEffect(() => {
    handleGetProductInfo();
  }, []);

  return (
    <ResponsiveLayout className={styles.main}>
      <Stack space={0}>
        <Inline space={16} alignItems="center">
          <IconClickAndCollectRegular size={40} />
          <Text8>Editar produto</Text8>
        </Inline>
        <Box paddingTop={8}>
          <Text4 medium>Edite os dados do produto selecionado abaixo</Text4>
        </Box>
        <Stack space={0}>
          <Box paddingTop={32}>
            <TextField 
              label="Nome"
              name="product-name"
              value={name}
              onChangeValue={setName}
              helperText="Pelo menos 2 caracteres"
            />
          </Box>
          <Box paddingTop={16}>
            <TextField 
              label="Marca"
              name="product-brand"
              value={brand}
              onChangeValue={setBrand}
              helperText="Pelo menos 2 caracteres"
            />
          </Box>
          <Box paddingTop={16}>
            <TextField 
              label="Descrição"
              name="product-description"
              value={description}
              onChangeValue={setDescription}
              helperText="Pelo menos 10 caracteres"
              multiline
            />
          </Box>
          <Box paddingTop={16}>
            <DecimalField 
              label="Preço"
              name="product-price"
              value={price}
              onChangeValue={setPrice}
              helperText="Pelo menos 0,01"
            />
          </Box>
          <Box paddingTop={16}>
            <DateField
              label="Data de validade"
              name="product-expiration-date"
              value={expirationDate}
              onChangeValue={setExpirationDate}
              min={new Date()}
              helperText="Insira uma data válida"
            />
          </Box>
        </Stack>
        <Box paddingTop={80}>
          <Inline space={16}>
            <ButtonSecondary onPress={router.back}>
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary disabled={validateFields()} onPress={() => {handleEditProduct()}}>
              Atualizar
            </ButtonPrimary>
          </Inline>
        </Box>
      </Stack>
    </ResponsiveLayout>
  )
}
