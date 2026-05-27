"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { faqs } from "~/src/components/marketing/home-data";
import { OceanPanel, SectionEyebrow, SectionLead, SectionTitle } from "~/src/components/marketing/marketing-ui";

export function HomeFaqInteractive() {
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>FAQ</SectionEyebrow>
        <SectionTitle className="mt-2">Common questions</SectionTitle>
        <SectionLead className="mx-auto">
          Expand any item below — billing, limits, exports, and demo access.
        </SectionLead>
      </div>

      <OceanPanel className="mx-auto mt-10 max-w-2xl px-2 md:px-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.q}
              value={`item-${i}`}
              className="border-white/10 px-2"
            >
              <AccordionTrigger className="text-left text-slate-100 hover:text-cyan-100 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-400">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </OceanPanel>
    </div>
  );
}
