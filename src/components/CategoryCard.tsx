interface CategoryCardProps {
  name: string;
  description: string;
  image: string;
  productCount: number;
  href: string;
}

export default function CategoryCard({ name, description, image, productCount, href }: CategoryCardProps) {
  return (
    <a 
      href={href}
      className="group block bg-white rounded-lg shadow-custom hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold mb-1">{name}</h3>
          <p className="text-sm opacity-90">{productCount} productos</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-muted text-sm">{description}</p>
      </div>
    </a>
  );
}








