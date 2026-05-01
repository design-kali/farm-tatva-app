const whatsappNumber = (
  import.meta.env.WHATSAPP_BUSINESS_NUMBER || "+919091924342"
).replace(/\/$/, "");

export const handleWhatsAppRedirect = (text: string) => {
  console.log(text);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

  window.open(whatsappUrl, "_blank");
};
