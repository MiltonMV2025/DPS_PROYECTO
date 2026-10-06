import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, type PressableProps, type ScrollViewProps } from "react-native";
import type { ReactNode } from "react";

export const colors = { primary: "#33A7DC", navy: "#16324F", muted: "#5B6B7A", background: "#F4FAFF", border: "#D6E5F0", white: "#FFFFFF", danger: "#B42318", dangerBackground: "#FFF1F0", success: "#167C52", successBackground: "#ECFDF3", info: "#2563A6", infoBackground: "#EFF6FF" } as const;

export function AppScreen({ children, scroll = true, contentStyle, ...props }: { children: ReactNode; scroll?: boolean; contentStyle?: object } & Omit<ScrollViewProps, "children" | "contentContainerStyle">) {
  const content = <View style={[styles.screenContent, contentStyle]}>{children}</View>;
  return <SafeAreaView style={styles.safe}>{scroll ? <ScrollView {...props} contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}</SafeAreaView>;
}

export function AppCard({ children, variant = "default", style }: { children: ReactNode; variant?: "default" | "highlight" | "action"; style?: object }) {
  return <View style={[styles.card, variant === "highlight" && styles.cardHighlight, variant === "action" && styles.cardAction, style]}>{children}</View>;
}

type ButtonVariant = "primary" | "secondary" | "danger";
export function AppButton({ title, variant = "primary", loading = false, disabled, style, ...props }: Omit<PressableProps, "style"> & { title: string; variant?: ButtonVariant; loading?: boolean; style?: object }) {
  return <Pressable accessibilityRole="button" {...props} disabled={disabled || loading} style={({ pressed }) => [styles.button, buttonStyles[variant], pressed && styles.pressed, (disabled || loading) && styles.disabled, style]}><Text style={[styles.buttonText, variant === "secondary" && styles.secondaryText]}>{loading ? "Cargando..." : title}</Text></Pressable>;
}
export const PrimaryButton = (props: Omit<React.ComponentProps<typeof AppButton>, "variant">) => <AppButton {...props} variant="primary" />;
export const SecondaryButton = (props: Omit<React.ComponentProps<typeof AppButton>, "variant">) => <AppButton {...props} variant="secondary" />;
export const DangerButton = (props: Omit<React.ComponentProps<typeof AppButton>, "variant">) => <AppButton {...props} variant="danger" />;

const statusMeta: Record<string, { label: string; color: string; background: string }> = {
  pendiente: { label: "Solicitud pendiente", color: colors.info, background: colors.infoBackground },
  confirmada: { label: "Cita confirmada", color: colors.success, background: colors.successBackground },
  completada: { label: "Completada", color: colors.success, background: colors.successBackground },
  cancelada: { label: "Cancelada", color: colors.danger, background: colors.dangerBackground },
};
export function StatusBadge({ status }: { status: string }) { const meta = statusMeta[status] ?? { label: status, color: colors.muted, background: "#F1F5F9" }; return <View style={[styles.badge, { backgroundColor: meta.background }]}><Text style={{ color: meta.color, fontWeight: "700", fontSize: 12 }}>{meta.label}</Text></View>; }

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <View style={styles.empty}><Text style={styles.emptyIcon}>○</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDescription}>{description}</Text>{action}</View>; }
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) { return <View style={styles.error}><Text style={styles.errorTitle}>No pudimos completar la solicitud</Text><Text style={styles.errorMessage}>{message}</Text>{onRetry && <SecondaryButton title="Reintentar" onPress={onRetry} />}</View>; }
export function LoadingState({ label = "Cargando información..." }: { label?: string }) { return <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>{label}</Text></View>; }
export function SectionHeader({ title, description }: { title: string; description?: string }) { return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{description && <Text style={styles.sectionDescription}>{description}</Text>}</View>; }
export function FieldError({ message }: { message?: string }) { return message ? <Text accessibilityRole="alert" style={styles.fieldError}>{message}</Text> : null; }

export const uiStyles = StyleSheet.create({ input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.navy, fontSize: 16 }, inputInvalid: { borderColor: colors.danger }, label: { color: colors.navy, fontWeight: "700", marginBottom: 6 }, multiline: { minHeight: 96, textAlignVertical: "top" } });

const buttonStyles = StyleSheet.create({ primary: { backgroundColor: colors.primary }, secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, danger: { backgroundColor: colors.danger } });
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, scrollContent: { flexGrow: 1 }, screenContent: { gap: 16, padding: 24 }, card: { gap: 10, padding: 18, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: "#E6F0F6", shadowColor: "#16324F", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, cardHighlight: { borderColor: colors.primary, borderWidth: 1.5 }, cardAction: { backgroundColor: colors.infoBackground }, button: { minHeight: 48, paddingHorizontal: 18, borderRadius: 12, alignItems: "center", justifyContent: "center" }, buttonText: { color: colors.white, fontWeight: "700", fontSize: 15 }, secondaryText: { color: colors.navy }, pressed: { opacity: 0.78 }, disabled: { opacity: 0.5 }, badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }, empty: { alignItems: "center", gap: 8, paddingVertical: 32 }, emptyIcon: { color: colors.primary, fontSize: 42, fontWeight: "300" }, emptyTitle: { color: colors.navy, fontSize: 18, fontWeight: "700", textAlign: "center" }, emptyDescription: { color: colors.muted, textAlign: "center", lineHeight: 20 }, error: { gap: 10, padding: 16, borderRadius: 12, backgroundColor: colors.dangerBackground, borderWidth: 1, borderColor: "#FECACA" }, errorTitle: { color: colors.danger, fontWeight: "700", fontSize: 16 }, errorMessage: { color: "#7F1D1D", lineHeight: 20 }, loading: { alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 36 }, loadingText: { color: colors.muted }, sectionHeader: { gap: 4 }, sectionTitle: { color: colors.navy, fontSize: 20, fontWeight: "700" }, sectionDescription: { color: colors.muted, lineHeight: 20 }, fieldError: { color: colors.danger, fontSize: 13, marginTop: 4 } });
