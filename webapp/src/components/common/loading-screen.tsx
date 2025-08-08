import MainLayout from "../layout/main-layout";

export default function LoadingScreen({
  disableLayout = false,
}: {
  disableLayout?: boolean;
}) {
  if (disableLayout) {
    return (
      <div
        className="w-8 h-8 rounded-full animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderTop: "2px solid rgba(255, 255, 255, 1)",
        }}
      />
    );
  }
  return (
    <MainLayout>
      <div
        className="w-8 h-8 rounded-full animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderTop: "2px solid rgba(255, 255, 255, 1)",
        }}
      />
    </MainLayout>
  );
}
