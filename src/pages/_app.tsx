import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeContextProvider, getTelefonicaSkin } from '@telefonica/mistica'
import "@telefonica/mistica/css/mistica.css";

const misticaTheme: any = {
  skin: getTelefonicaSkin(),
  i18n: {locale: 'es-ES', phoneNumberFormattingRegionCode: 'ES'},
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeContextProvider theme={misticaTheme}>
      <Component {...pageProps} />
    </ThemeContextProvider>
  ) 
}
