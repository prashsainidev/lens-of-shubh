import CustomCursor from "@/components/public/CustomCursor";
import SiteEffects from "@/components/public/SiteEffects";
import CameraShutter from "@/components/public/CameraShutter";
import "../globals.css";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CameraShutter />
      <CustomCursor />
      <SiteEffects />
      {children}
    </>
  );
}
