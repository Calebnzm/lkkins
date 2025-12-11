import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ShieldCheck, Zap, Download, Calendar, Mail, CheckCircle2, Phone, MapPin, Globe, Instagram, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";


type FormState = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
};

const images = [
  "/polos.png",
  "/sports.png",
  "/tracksuits.png",
  "/uniform.png",
  "/staff.png",
];

const mockups = [
  { src: "/polo_potrait.png", alt: "Premium Custom Polo Shirts" },
  { src: "/hoodei_potrait.png", alt: "Branded Hoodies & Outerwear" },
  { src: "/tracksuit_potrait.png", alt: "Professional Sports Kits" },
];

const services = [
  {
    icon: ShieldCheck,
    title: "Corporate Branding Solutions",
    desc: "Elevate your team's professional image with custom-embroidered polos, shirts, and uniforms. Perfect for field teams, retail staff, and corporate events.",
    features: ["Custom embroidery & printing", "Premium fabric options", "Bulk order discounts"],
  },
  {
    icon: Zap,
    title: "Sports & Event Apparel",
    desc: "High-performance team jerseys and sports kits designed for corporate sports days, tournaments, and sponsored events. Built to perform, branded to impress.",
    features: ["Moisture-wicking materials", "Custom team designs", "Fast turnaround times"],
  },
  {
    icon: Sparkles,
    title: "Promotional Merchandise",
    desc: "From jackets and hoodies to branded giveaways, create lasting impressions at events, trade shows, and corporate activations with premium merchandise.",
    features: ["Event-ready packaging", "Small batch options", "Quality guaranteed"],
  },
];
function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Images Carousel */}
      <div className="absolute inset-0 z-0">
        {images.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
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
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg rounded-full border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-gray-900 transition-all duration-300"
              asChild
            >
              <a href="/catalog.pdf" download>
                <Download className="mr-2 h-5 w-5" />
                Download Catalog
              </a>
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
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current ? "w-8 bg-amber-500" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
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
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-amber-500 transition-all duration-300 hover:shadow-xl bg-white"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">{service.title}</CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {service.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.features.map((feature) => (
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

function Mockups() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            See the Quality
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every piece is crafted with precision and branded to perfection. Here's a glimpse of what we deliver.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockups.map((img, index) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadBrochure() {
  return (
    <section className="py-24 bg-gradient-to-br from-amber-500 to-orange-600">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Download className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Download Our Complete Catalog
          </h2>
          <p className="text-xl mb-10 text-white/95 leading-relaxed">
            Explore our full range of styles, fabrics, branding options, and pricing. Everything you need to make an informed decision, in one comprehensive guide.
          </p>
          <Button
            size="lg"
            className="bg-white text-amber-600 hover:bg-gray-100 h-14 px-10 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            asChild
          >
            <a href="/catalog.pdf" download>
              <Download className="mr-2 h-5 w-5" />
              Get the Brochure
            </a>
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



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addDoc(collection(db, "enquiries"), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company || null,
        message: form.message || null,
        createdAt: serverTimestamp(),
      });
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err) {
      console.error(err);
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
              <div className="space-y-6">
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
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? "Sending..." : "Send Inquiry"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-full"
                    asChild
                  >
                    <a href="https://calendly.com/your-link" target="_blank" rel="noreferrer">
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule a Call
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md supports-[backdrop-filter]:bg-white/95 border-b border-gray-200 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl tracking-tight">LE</span>
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

          {/* Navigation Actions */}
          <nav className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex rounded-full border-2 border-gray-300 hover:border-amber-500 hover:text-amber-600 transition-all duration-300"
              asChild
            >
              <a href="/catalog.pdf" download>
                <Download className="mr-2 h-4 w-4" />
                Catalog
              </a>
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
              asChild
            >
              <a href="#contact">
                <Mail className="mr-2 h-4 w-4" />
                Get Quote
              </a>
            </Button>
          </nav>
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
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center rounded-2xl shadow-2xl">
                <span className="text-2xl">LE</span>
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
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-amber-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-amber-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-white" />
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
              <li>
                <a href="/catalog.pdf" download className="hover:text-amber-400 transition-colors duration-300">
                  Download Catalog
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
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:LKKINSElegance@gmail.com"
                  className="hover:text-amber-400 transition-colors duration-300 break-all"
                >
                  LKKINSElegance@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span>+254 712 345 678</span>
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

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <Mockups />
        <DownloadBrochure />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}