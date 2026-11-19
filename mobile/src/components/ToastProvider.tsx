import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/components/ui";

type ToastVariant = "success" | "info" | "error";
type ToastInput = { variant: ToastVariant; title: string; message?: string; duration?: number };
type ActiveToast = Required<Pick<ToastInput, "duration">> & ToastInput & { id: number };

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

const palette: Record<ToastVariant, { color: string; background: string; border: string }> = {
  success: { color: colors.success, background: colors.successBackground, border: "#A6E3C4" },
  info: { color: colors.info, background: colors.infoBackground, border: "#BFDBFE" },
  error: { color: colors.danger, background: colors.dangerBackground, border: "#FECACA" },
};

/** Muestra un mensaje a la vez; uno nuevo reemplaza al anterior. */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const nextId = useRef(0);
  const show = useCallback((input: ToastInput) => {
    nextId.current += 1;
    setToast({ duration: 5000, ...input, id: nextId.current });
  }, []);
  const close = useCallback((id: number) => setToast((current) => (current?.id === id ? null : current)), []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && <ToastAlert key={toast.id} toast={toast} onClose={() => close(toast.id)} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used within ToastProvider");
  return show;
}

function ToastAlert({ toast, onClose }: { toast: ActiveToast; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const meta = palette[toast.variant];
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const timer = setTimeout(() => closeRef.current(), toast.duration);
    return () => clearTimeout(timer);
  }, [opacity, toast.duration]);

  // Arriba de la pantalla para que el teclado no lo tape mientras se llena un formulario.
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { top: insets.top + 8, opacity }]}
    >
      <View
        accessibilityRole={toast.variant === "error" ? "alert" : "summary"}
        accessibilityLiveRegion={toast.variant === "error" ? "assertive" : "polite"}
        style={[styles.toast, { backgroundColor: meta.background, borderColor: meta.border }]}
      >
        <View style={styles.texts}>
          <Text style={[styles.title, { color: meta.color }]}>{toast.title}</Text>
          {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar mensaje" hitSlop={12} onPress={onClose} style={styles.close}>
          <Text style={[styles.closeText, { color: meta.color }]}>✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", left: 16, right: 16, zIndex: 100, elevation: 8 },
  toast: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, shadowColor: "#16324F", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  texts: { flex: 1, gap: 3 },
  title: { fontWeight: "800", fontSize: 15 },
  message: { color: colors.navy, lineHeight: 19 },
  close: { paddingHorizontal: 4 },
  closeText: { fontSize: 16, fontWeight: "700" },
});
