import Constants, { ExecutionEnvironment } from "expo-constants";
import {
  logGoogleAuthFailure,
  logGoogleAuthStage,
  type GoogleAuthStage,
} from "./google-auth-diagnostics";

let configured = false;

export async function signInWithGoogleFirebase() {
  let stage: GoogleAuthStage = "native_modules";
  try {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      throw new Error(
        "Google Sign-In requiere una development build de la aplicación.",
      );
    }

    const [auth, google] = await Promise.all([
      import("@react-native-firebase/auth"),
      import("react-native-nitro-google-signin"),
    ]);
    logGoogleAuthStage("native_modules");
    if (!configured) {
      stage = "google_configuration";
      google.GoogleOneTapSignIn.configure({ webClientId: "autoDetect" });
      configured = true;
    }

    const {
      GoogleOneTapSignIn,
      isCancelledResponse,
      isNoSavedCredentialFoundResponse,
      isSuccessResponse,
    } = google;
    stage = "play_services";
    await GoogleOneTapSignIn.checkPlayServices();
    logGoogleAuthStage("play_services");

    stage = "google_account_picker";
    let response = await GoogleOneTapSignIn.signIn();
    if (isNoSavedCredentialFoundResponse(response)) {
      stage = "google_account_creation";
      response = await GoogleOneTapSignIn.createAccount();
    }
    if (isNoSavedCredentialFoundResponse(response)) {
      stage = "google_explicit_sign_in";
      response = await GoogleOneTapSignIn.presentExplicitSignIn();
    }
    if (isCancelledResponse(response)) {
      logGoogleAuthStage("google_account_picker", "cancelled");
      return null;
    }
    if (!isSuccessResponse(response))
      throw new Error("No pudimos iniciar sesión con Google.");
    logGoogleAuthStage("google_account_picker");

    const idToken = response.data.idToken;
    if (!idToken) throw new Error("Google no devolvió un token de identidad.");

    stage = "firebase_credential";
    const credential = auth.GoogleAuthProvider.credential(idToken);
    logGoogleAuthStage("firebase_credential");
    stage = "firebase_sign_in";
    const result = await auth.signInWithCredential(auth.getAuth(), credential);
    logGoogleAuthStage("firebase_authenticated");
    return result.user;
  } catch (error) {
    logGoogleAuthFailure(stage, error);
    throw error;
  }
}

export async function signOutGoogleFirebase() {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient)
    return;
  const [auth, google] = await Promise.all([
    import("@react-native-firebase/auth"),
    import("react-native-nitro-google-signin"),
  ]);
  await Promise.allSettled([
    auth.signOut(auth.getAuth()),
    google.GoogleOneTapSignIn.signOut(),
  ]);
}
