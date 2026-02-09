import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { Sparkles, ShieldCheck, Zap, Mail, CheckCircle2, Phone, MapPin, Globe, ShoppingBag, ArrowRight, Star, Award, Briefcase, Users, Percent, Tag } from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import ShopPage from "@/pages/ShopPage";
import CheckoutPage from "@/pages/CheckoutPage";
import { useHeroImages, useMockups, useCorporateDiscounts, urlFor, type SanityCorporateDiscount } from "@/hooks/useSanity";

// Icon mapping for dynamic icons from Sanity
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Zap,
  Sparkles,
  Star,
  Award,
  Briefcase,
};


type FormState = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
};

// Fallback data when Sanity content is not yet loaded
const fallbackImages = [
  "/polos.png",
  "/sports.png",
  "/tracksuits.png",
  "/uniform.png",
  "/staff.png",
];

const fallbackMockups = [
  { src: "/polo_potrait.png", alt: "Premium Custom Polo Shirts" },
  { src: "/hoodei_potrait.png", alt: "Branded Hoodies & Outerwear" },
  { src: "/tracksuit_potrait.png", alt: "Professional Sports Kits" },
];

const fallbackServices = [
  {
    icon: "ShieldCheck",
    title: "Corporate Branding Solutions",
    description: "Elevate your team's professional image with custom-embroidered polos, shirts, and uniforms. Perfect for field teams, retail staff, and corporate events.",
    features: ["Custom embroidery & printing", "Premium fabric options", "Bulk order discounts"],
  },
  {
    icon: "Zap",
    title: "Sports & Event Apparel",
    description: "High-performance team jerseys and sports kits designed for corporate sports days, tournaments, and sponsored events. Built to perform, branded to impress.",
    features: ["Moisture-wicking materials", "Custom team designs", "Fast turnaround times"],
  },
  {
    icon: "Sparkles",
    title: "Promotional Merchandise",
    description: "From jackets and hoodies to branded giveaways, create lasting impressions at events, trade shows, and corporate activations with premium merchandise.",
    features: ["Event-ready packaging", "Small batch options", "Quality guaranteed"],
  },
];

const fallbackCoreValues = [
  {
    title: "Precision",
    description: "Attention to detail in every stitch and every logo.",
  },
  {
    title: "Reliability",
    description: "Delivering on time, every time, for every client.",
  },
  {
    title: "Professionalism",
    description: "Elevating our clients' brands through superior quality.",
  },
];
function Hero() {
  const [current, setCurrent] = useState(0)
  const { data: heroImages } = useHeroImages();

  // Use Sanity images if available, otherwise use fallback
  const images = heroImages.length > 0
    ? heroImages.map((img) => urlFor(img.image).width(1920).url())
    : fallbackImages;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Images Carousel */}
      <div className="absolute inset-0 z-0">
        {images.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
              }`}
          >
            <img src={src || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-slate-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Branded Apparel That{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Elevates Your Team
            </span>
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-gray-200 leading-relaxed max-w-2xl">
            Premium corporate uniforms, sports kits, and promotional wear. Delivered fast, crafted to last, designed to
            impress.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white h-14 px-8 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Mail className="mr-2 h-5 w-5" />
              Get Your Custom Quote
            </Button>
          </div>

          {/* Trust Badges - updated for dark background */}
          <div className="flex flex-wrap gap-6 text-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium">Fast Turnaround</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium">Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium">Small Batch Friendly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === current ? "w-8 bg-amber-500" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

function Services() {
  // Use hardcoded services data (removed from CMS)
  const services = fallbackServices;

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            What We Deliver
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From corporate teams to sports events, we provide end-to-end branding solutions that make your organization stand out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || ShieldCheck;
            return (
              <Card
                key={`service-${index}`}
                className="border-2 hover:border-amber-500 transition-all duration-300 hover:shadow-xl bg-white"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">{service.title}</CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.features?.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MissionVision() {
  // Use hardcoded values (removed from CMS)
  const coreValues = fallbackCoreValues;
  const mission = "To provide institutions and individuals with high-quality, branded hoodies, T-shirts, polo shirts, and caps that build professional pride and lasting impressions.";
  const vision = "To be the most trusted partner for custom outfit solutions, recognized for seamless service and exceptional garment durability.";

  return (
    <section id="about" className="py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-amber-400 uppercase tracking-[0.2em] text-sm font-semibold mb-2">
                Who We Are
              </p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Mission, Vision & Core Values
              </h2>
              <p className="text-lg text-gray-200 mt-4 max-w-3xl">
                Clear purpose and consistent standards guide how we serve every client—whether outfitting a full institution or a single team.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                <p className="text-amber-300 text-sm font-semibold mb-2">Mission</p>
                <p className="text-lg text-gray-100 leading-relaxed">
                  {mission}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                <p className="text-amber-300 text-sm font-semibold mb-2">Vision</p>
                <p className="text-lg text-gray-100 leading-relaxed">
                  {vision}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
            <p className="text-amber-300 text-sm font-semibold mb-4">Core Values</p>
            <div className="space-y-4">
              {coreValues.map((value: { title: string; description: string }) => (
                <div key={value.title} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">{value.title}</p>
                    <p className="text-gray-200 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Mockups() {
  const { data: sanityMockups } = useMockups();

  // If we have Sanity data, show it with pricing. Otherwise use fallback without pricing.
  const hasSanityData = sanityMockups.length > 0;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Tag className="h-4 w-4" />
            Our Products & Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            See the Quality
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every piece is crafted with precision and branded to perfection. Here's a glimpse of what we deliver.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hasSanityData ? (
            // Sanity mockups with pricing
            sanityMockups.map((mockup) => (
              <div
                key={mockup._id}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
              >
                <div className="overflow-hidden">
                  <img
                    src={urlFor(mockup.image).width(600).height(450).url()}
                    alt={mockup.alt}
                    className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 bg-white">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{mockup.alt}</h3>
                  {mockup.startingPrice && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-gray-500">Starting from</span>
                      <span className="text-2xl font-bold text-amber-600">
                        KSh {mockup.startingPrice.toLocaleString()}
                      </span>
                      {mockup.priceNote && (
                        <span className="text-sm text-gray-500">{mockup.priceNote}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Fallback mockups without pricing
            fallbackMockups.map((img, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white font-semibold text-lg">{img.alt}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">
            * Prices are per piece for bulk orders. Final pricing varies based on quantity, customization, and design complexity.
          </p>
        </div>
      </div>
    </section>
  );
}

// Download brochure section intentionally disabled for now.
// function DownloadBrochure() {
//   return (
//     <section className="py-24 bg-gradient-to-br from-amber-500 to-orange-600">
//       <div className="container mx-auto px-6">
//         <div className="max-w-4xl mx-auto text-center">
//           <Download className="h-16 w-16 text-white mx-auto mb-6" />
//           <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
//             Download Our Complete Catalog
//           </h2>
//           <p className="text-xl mb-10 text-white/95 leading-relaxed">
//             Explore our full range of styles, fabrics, branding options, and pricing. Everything you need to make an informed decision, in one comprehensive guide.
//           </p>
//           <Button
//             size="lg"
//             className="bg-white text-amber-600 hover:bg-gray-100 h-14 px-10 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
//             asChild
//           >
//             <a href="/catalog.pdf" download>
//               <Download className="mr-2 h-5 w-5" />
//               Get the Brochure
//             </a>
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// }
// }

function CorporateDiscountsSection() {
  const { data: corporateDiscounts } = useCorporateDiscounts();

  // Don't show section if no active discounts
  if (corporateDiscounts.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-100 via-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30"></div>

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Users className="h-4 w-4" />
            Corporate & Bulk Orders
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Volume <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Discounts</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Planning a large order for your team or organization? Enjoy exclusive discounts on bulk purchases.
          </p>
        </div>

        {/* Discount Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {corporateDiscounts.map((discount: SanityCorporateDiscount) => (
            <Card
              key={discount._id}
              className="relative overflow-hidden border-2 hover:border-amber-500 transition-all duration-300 hover:shadow-xl bg-white"
            >
              {/* Accent stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: discount.highlightColor || '#F59E0B' }}
              ></div>
              <CardHeader className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {discount.maxQuantity
                      ? `${discount.minQuantity} - ${discount.maxQuantity} items`
                      : `${discount.minQuantity}+ items`
                    }
                  </span>
                  <div
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-white font-bold text-lg"
                    style={{ backgroundColor: discount.highlightColor || '#F59E0B' }}
                  >
                    <Percent className="h-4 w-4" />
                    {discount.discountPercentage}%
                  </div>
                </div>
                <CardTitle className="text-2xl text-gray-900">{discount.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {discount.displayMessage}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Phone className="h-4 w-4 text-amber-500" />
                  <span>Contact us for a personalized quote</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Ready to place a corporate order? Get a personalized quote.
          </p>
          <Button
            size="lg"
            className="bg-slate-800 hover:bg-slate-900 text-white h-14 px-10 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Mail className="mr-2 h-5 w-5" />
            Request Corporate Quote
          </Button>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // EmailJS Configuration - uses environment variables
  // Create a .env.local file with your EmailJS credentials (see EMAILJS_SETUP.md)
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
  const RECIPIENT_EMAIL = import.meta.env.VITE_RECIPIENT_EMAIL || "LKKINSElegance@gmail.com";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Check if EmailJS is configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      toast.error("Email service is not configured. Please check your environment variables.");
      console.error("EmailJS configuration missing. Please set up .env.local file.");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare email template parameters
      const templateParams = {
        from_name: form.name,
        from_email: form.email,
        phone: form.phone,
        company: form.company || "Not provided",
        message: form.message || "No message provided",
        to_email: RECIPIENT_EMAIL,
      };

      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      toast.success("Message sent! We'll get back to you within 24 hours.");

      // Store email in Sanity CMS for newsletter campaigns
      try {
        await fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            name: form.name,
          }),
        });
      } catch (err) {
        console.error("Subscribe API error:", err);
      }
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err) {
      console.error("EmailJS error:", err);
      toast.error("Something went wrong. Please try again or contact us directly.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Let's Bring Your Vision to Life
            </h2>
            <p className="text-xl text-gray-600">
              Tell us about your project and we'll provide a tailored quote within 24 hours.
            </p>
          </div>

          <Card className="border-2 shadow-xl bg-white">
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="h-12 border-2 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@company.com"
                    className="h-12 border-2 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+254 712 345 678"
                    className="h-12 border-2 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Company / Organization
                  </label>
                  <Input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Your Company Ltd."
                    className="h-12 border-2 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Project Details
                  </label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    placeholder="Tell us about your requirements: item type, quantity, branding needs, and timeline..."
                    className="resize-none border-2 focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? "Sending..." : "Send Inquiry"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Header() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md supports-[backdrop-filter]:bg-white/95 border-b border-gray-200 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 blur-lg opacity-30"></div>
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-xl bg-white">
                <img
                  src="/logo.png"
                  alt="LKKINS Elegance Logo"
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                LKKINS ELEGANCE
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium">
                Premium Corporate Apparel • Nairobi
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollToSection("services")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            >
              Services
            </button>
            <Link
              to="/shop"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            >
              Shop
            </Link>
            <button
              onClick={() => scrollToSection("about")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* CTA Button */}
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
            onClick={() => scrollToSection("contact")}
          >
            <Mail className="mr-2 h-4 w-4" />
            Get Quote
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/10">
                <img
                  src="/logo.png"
                  alt="LKKINS Elegance Logo"
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  LKKINS ELEGANCE
                </h3>
                <p className="text-sm text-gray-300">
                  Premium Corporate Apparel
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Elevating corporate identity through premium branded apparel. Serving teams, events, and organizations across Kenya with quality craftsmanship and professional service.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.tiktok.com/@lkkins.elegancep"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-amber-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="TikTok"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-white fill-current"
                  aria-hidden="true"
                >
                  <path d="M21 8.25a6.75 6.75 0 01-3.9-1.23v7.18A5.8 5.8 0 0111.4 20 5.4 5.4 0 016 14.6 5.4 5.4 0 0111.4 9.2c.19 0 .38.01.57.03v2.3a3.08 3.08 0 00-.57-.05 3.1 3.1 0 00-3.1 3.12 3.1 3.1 0 003.1 3.12 3.3 3.3 0 003.2-2.36l.1-.33V4h2.3a4.44 4.44 0 00.05.64 4.44 4.44 0 004.05 3.58v2.03z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">
              Services
            </h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                  Corporate Branding
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                  Sports & Event Apparel
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                  Promotional Merchandise
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">
              Get In Touch
            </h4>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span>Baraka Court Mall off Ngong Road, shop FD1.</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:sales@lkkinselegance.com"
                  className="hover:text-amber-400 transition-colors duration-300 whitespace-nowrap"
                >
                  sales@lkkinselegance.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:director@lkkinselegance.com"
                  className="hover:text-amber-400 transition-colors duration-300 whitespace-nowrap"
                >
                  director@lkkinselegance.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span>0796 905661</span>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span>Available Nationwide</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} LKKINS Elegance Clothing. All rights reserved.
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
              Quality Crafted, Professionally Branded
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function IndividualShop() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with gradient pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg shadow-amber-200">
              <ShoppingBag className="h-5 w-5" />
              🆕 Personal Shopping Now Available!
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Shop <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Single Pieces</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Want just one hoodie or a couple of t-shirts? No minimum orders required.
              Browse our catalog and order any quantity—even just one item!
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Side - Features */}
              <div className="p-10 lg:p-14 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Why Shop With Us?</h3>

                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">No Minimum Orders</h4>
                      <p className="text-gray-600">Order 1 item or 100—your choice, no restrictions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Premium Quality</h4>
                      <p className="text-gray-600">Same quality as our corporate orders</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Fast Delivery</h4>
                      <p className="text-gray-600">Quick shipping across Kenya</p>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-16 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-amber-200 hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
                  asChild
                >
                  <Link to="/shop">
                    <ShoppingBag className="mr-3 h-6 w-6" />
                    Browse Our Shop
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
              </div>

              {/* Right Side - Product Showcase */}
              <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8 lg:p-12 rounded-3xl lg:rounded-none lg:rounded-r-3xl">
                {/* Decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500 rounded-full blur-3xl opacity-30"></div>

                {/* Featured Product */}
                <div className="relative mb-6">
                  <div className="text-center mb-4">
                    <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      ⭐ Most Popular
                    </span>
                  </div>
                  <div className="relative group rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20">
                    <img
                      src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=300&fit=crop"
                      alt="Premium Hoodie"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-bold text-xl mb-1">Premium Hoodies</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-bold text-lg">From KSh 2,500</span>
                        <span className="text-white/60 text-sm">Multiple Colors</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Category Strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="group text-center">
                    <div className="relative rounded-xl overflow-hidden mb-2 border border-white/20 hover:border-amber-400/50 transition-all">
                      <img
                        src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=150&fit=crop"
                        alt="T-Shirts"
                        className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-white text-sm font-medium">T-Shirts</p>
                    <p className="text-amber-400 text-xs">KSh 800+</p>
                  </div>
                  <div className="group text-center">
                    <div className="relative rounded-xl overflow-hidden mb-2 border border-white/20 hover:border-amber-400/50 transition-all">
                      <img
                        src="https://images.unsplash.com/photo-1625910513413-5fc42c5c7e89?w=200&h=150&fit=crop"
                        alt="Polo Shirts"
                        className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-white text-sm font-medium">Polos</p>
                    <p className="text-amber-400 text-xs">KSh 1,500+</p>
                  </div>
                  <div className="group text-center">
                    <div className="relative rounded-xl overflow-hidden mb-2 border border-white/20 hover:border-amber-400/50 transition-all">
                      <img
                        src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&h=150&fit=crop"
                        alt="Caps"
                        className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-white text-sm font-medium">Caps</p>
                    <p className="text-amber-400 text-xs">KSh 500+</p>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>Trusted by 500+ happy customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <IndividualShop />
        <MissionVision />
        <Mockups />
        <CorporateDiscountsSection />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-200/40 shadow-2xl",
            actionButton: "bg-white text-amber-600",
            cancelButton: "bg-white/10 text-white",
          },
        }}
      />
    </>
  );
}