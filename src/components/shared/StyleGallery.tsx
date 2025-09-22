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
  descriptionText?: string;
  descriptionClassName?: string;
  useCardWrapper?: boolean;
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
  descriptionText,
  descriptionClassName,
  useCardWrapper = true,
}: StyleGalleryProps) {
  return (
    <section className={sectionClassName}>
      <div className={containerClassName}>
        <h2 className={titleClassName}>{titleText}</h2>
        {descriptionText ? (
          <p className={descriptionClassName}>{descriptionText}</p>
        ) : null}
        <div className={gridClassName}>
          {items.map((item) => (
            useCardWrapper ? (
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
            ) : (
              <div key={item.id} className={cardClassName}>
                <img
                  src={item.src}
                  alt={item.alt}
                  className={imgClassName}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
