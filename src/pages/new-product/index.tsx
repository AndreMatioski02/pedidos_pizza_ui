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
import styles from "./NewProduct.module.css";
import { useRouter } from "next/router";
import { api } from "@/services/base";

export default function NewProduct() {
  const [name, setName] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [expirationDate, setExpirationDate] = React.useState("");
  const router = useRouter();

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

  const handleAddNewProduct = async () => {
    try{
      await api.post("/create/product", {
        name,
        brand,
        price: Number(price.replace(",", ".")),
        expiration_date: expirationDate,
        description
      });
      alert({
        title: "Produto cadastrado com sucesso!",
        message: "Você será redirecionado para o catálogo atualizado",
        acceptText: "Ok, continuar",
        onAccept() { router.replace("/list-products") },
      });
    } catch(err) {
      console.log(err);
      alert({
        title: "Algo deu errado por aqui",
        message: "Parece que algo deu errado para cadastrar o produto! Por favor, tente novamente",
        acceptText: "Fechar"
      });
    }
  }

  return (
    <ResponsiveLayout className={styles.main}>
      <Stack space={0}>
        <Text8><IconClickAndCollectRegular size={40} /> Novo produto</Text8>
        <Box paddingTop={8}>
          <Text4 medium>Cadastre um novo produto ao catálogo abaixo</Text4>
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
            <ButtonPrimary disabled={validateFields()} onPress={() => {handleAddNewProduct()}}>
              Cadastrar produto
            </ButtonPrimary>
          </Inline>
        </Box>
      </Stack>
    </ResponsiveLayout>
  )
}
