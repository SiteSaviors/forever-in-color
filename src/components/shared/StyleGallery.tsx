import { Card, CardContent } from "@/components/ui/card";

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
};

type StyleGalleryProps = {
  items: GalleryItem[];
  sectionClassName: string;
  containerClassName: string;
  titleText: string;
  titleClassName: string;
  gridClassName: string;
  cardClassName: string;
  imgClassName: string;
};

export default function StyleGallery({
  items,
  sectionClassName,
  containerClassName,
  titleText,
  titleClassName,
  gridClassName,
  cardClassName,
  imgClassName,
}: StyleGalleryProps) {
  return (
    <section className={sectionClassName}>
      <div className={containerClassName}>
        <h2 className={titleClassName}>{titleText}</h2>
        <div className={gridClassName}>
          {items.map((item) => (
            <Card key={item.id} className={cardClassName}>
              <CardContent className="p-0">
                <img
                  src={item.src}
                  alt={item.alt}
                  className={imgClassName}
                  loading="lazy"
                  decoding="async"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
