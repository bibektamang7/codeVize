"use client"
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How does Codevize integrate with GitHub?",
      answer: "Codevize integrates directly with your GitHub repositories through our GitHub App. Once installed, our AI assistant will automatically review pull requests and tag issues based on your codebase patterns."
    },
    {
      question: "Can I customize the AI's review criteria?",
      answer: "Yes! Our Pro and Enterprise plans allow you to customize review criteria based on your team's coding standards and best practices. You can set specific rules for what the AI should look for during reviews."
    },
    {
      question: "How accurate is the issue tagging?",
      answer: "Our AI has been trained on thousands of open-source projects and achieves an accuracy rate of over 85% for issue classification. The system continuously learns from your team's feedback to improve accuracy over time."
    },
    {
      question: "What programming languages do you support?",
      answer: "We currently support all major programming languages including JavaScript, TypeScript, Python, Java, C#, Go, and Rust. Our multi-language support is constantly expanding based on community needs."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a 14-day free trial for all plans. During the trial, you'll have full access to all features of the plan you choose, allowing you to evaluate Codevize with your team's real projects."
    },
    {
      question: "How secure is my code?",
      answer: "We take security very seriously. Your code is only accessed to perform reviews and is never stored permanently. All communications are encrypted, and we comply with GDPR and other privacy regulations."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-[#ffffff1a] rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left bg-gradient-to-b from-[#ffffff03] to-transparent hover:from-[#ffffff08]"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-white">{faq.question}</span>
                {openIndex === index ? 
                  <Minus className="text-muted-foreground" size={20} /> : 
                  <Plus className="text-muted-foreground" size={20} />
                }
              </button>
              {openIndex === index && (
                <div className="p-6 pt-0 border-t border-[#ffffff0a]">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;