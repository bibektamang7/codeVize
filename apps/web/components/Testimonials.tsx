import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

const Testimonials = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Lead Developer",
      company: "TechCorp",
      content: "Codevize has transformed our PR review process. What used to take hours now takes minutes with AI-powered insights.",
      avatar: "/avatar1.png",
      rating: 5
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Engineering Manager",
      company: "InnovateLab",
      content: "The automatic issue tagging feature has saved our team countless hours. Issues are now properly categorized from the start.",
      avatar: "/avatar2.png",
      rating: 5
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "CTO",
      company: "StartupXYZ",
      content: "We've reduced our time-to-merge by 40% since implementing Codevize. The AI suggestions are incredibly accurate.",
      avatar: "/avatar3.png",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#0a0a0a] to-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-300">
            Loved by developers worldwide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who are already using Codevize to streamline their workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-gradient-to-b from-[#ffffff05] to-black/50 rounded-2xl border border-[#ffffff1a] p-6"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} 
                  />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium mr-3">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;