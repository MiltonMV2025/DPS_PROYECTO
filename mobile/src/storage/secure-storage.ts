import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "sonrisa.mobile.refresh-token";

export const sessionStorage = {
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (value: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, value),
  clear: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
};
