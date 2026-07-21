import os
import re
from fpdf import FPDF

class ResumePDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.set_margins(15, 15, 15)
        self.set_auto_page_break(True, margin=15)
        # Custom Colors to avoid conflict with internal properties
        self.color_primary = (26, 54, 93)     # Deep slate/blue
        self.color_secondary = (74, 85, 104)   # Cool grey/slate
        self.color_text = (51, 51, 51)         # Dark grey

    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 5, "Edem Robin | Network Engineer & Python Developer", border=0, align="R", new_x="LMARGIN", new_y="NEXT")
            # Draw a subtle line under running header
            self.set_draw_color(220, 220, 220)
            self.set_line_width(0.2)
            self.line(15, self.get_y(), 195, self.get_y())
            self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        # Draw a subtle line above footer
        self.set_draw_color(220, 220, 220)
        self.set_line_width(0.2)
        self.line(15, self.get_y() - 2, 195, self.get_y() - 2)
        self.cell(0, 10, f"Page {self.page_no()} of {{nb}}", border=0, align="C")

    def clean_markdown_line(self, line):
        # Strip markdown syntax and emojis
        # Remove emojis (replace with empty string)
        line = re.sub(r'[^\x00-\x7F]+', '', line)
        line = line.strip()
        return line

    def write_rich_text(self, text, h=5, align='L'):
        # Parse inline bold blocks (**bold**)
        parts = text.split('**')
        current_font_style = self.font_style
        current_font_size = self.font_size_pt

        for i, part in enumerate(parts):
            if i % 2 == 1:
                self.set_font('Helvetica', 'B', current_font_size)
            else:
                self.set_font('Helvetica', current_font_style, current_font_size)

            # Print text segment
            self.write(h, part)

        # Restore font
        self.set_font('Helvetica', current_font_style, current_font_size)

    def add_bullet_point(self, text):
        # Bullet layout
        self.set_x(20)
        # Draw custom bullet (small elegant colored square)
        self.set_fill_color(*self.color_secondary)
        self.set_draw_color(*self.color_secondary)
        bullet_y = self.get_y() + 1.8
        self.rect(20, bullet_y, 1.2, 1.2, 'F')

        # Text
        self.set_x(25)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self.color_text)

        # Render inline rich text inside a bullet block.
        cleaned_text = text.strip()
        parts = cleaned_text.split('**')
        for i, part in enumerate(parts):
            if i % 2 == 1:
                self.set_font('Helvetica', 'B', 10)
            else:
                self.set_font('Helvetica', '', 10)

            # Use self.write so it wraps naturally
            self.write(5, part)

        self.ln(6)

def compile_resume(md_path, pdf_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    pdf = ResumePDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    # Custom elegant Header on First Page
    # Edem Robin - Title
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(*pdf.color_primary)
    pdf.cell(0, 12, "EDEM ROBIN", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(*pdf.color_secondary)
    pdf.cell(0, 6, "Network Engineer | Python Developer | Network Automation Enthusiast", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(3)

    # Beautiful compact contact bar
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(80, 80, 80)
    contact_info = [
        "Location: Ghana",
        "Email: edem@edemrobin.com",
        "Portfolio: https://edemrobin.com",
        "GitHub: github.com/kojoedem",
        "LinkedIn: linkedin.com/in/amedzo-edem-robin-2a484890"
    ]
    pdf.cell(0, 5, " | ".join(contact_info[:3]), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 5, " | ".join(contact_info[3:]), align="C", new_x="LMARGIN", new_y="NEXT")

    # Top rule
    pdf.ln(3)
    pdf.set_draw_color(*pdf.color_primary)
    pdf.set_line_width(0.5)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)

    # Process MD lines
    in_header_block = True

    for line in lines:
        raw_line = line.strip()
        if not raw_line:
            continue

        # Detect first page header lines to skip them
        if in_header_block:
            if raw_line.startswith("# ") and "Edem Robin" in raw_line:
                continue
            if raw_line.startswith("## ") and "Network Engineer" in raw_line:
                continue
            if any(contact in raw_line for contact in ["Ghana", "Portfolio", "Email", "LinkedIn", "GitHub", "https://"]):
                continue
            if raw_line == "---":
                in_header_block = False
                continue

        # Parse elements
        if raw_line.startswith("# "):
            title = pdf.clean_markdown_line(raw_line[2:])
            # Heading 1
            # Check remaining space (ensure at least 40mm)
            if pdf.h - pdf.b_margin - pdf.get_y() < 40:
                pdf.add_page()
            else:
                pdf.ln(4)

            pdf.set_font("Helvetica", "B", 13)
            pdf.set_text_color(*pdf.color_primary)
            pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")

            # Subtitle line
            pdf.set_draw_color(*pdf.color_secondary)
            pdf.set_line_width(0.3)
            pdf.line(15, pdf.get_y(), 195, pdf.get_y())
            pdf.ln(3)

        elif raw_line.startswith("## "):
            title = pdf.clean_markdown_line(raw_line[3:])
            # Heading 2
            if pdf.h - pdf.b_margin - pdf.get_y() < 25:
                pdf.add_page()
            else:
                pdf.ln(2)

            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(*pdf.color_secondary)
            pdf.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")

        elif raw_line.startswith("### "):
            title = pdf.clean_markdown_line(raw_line[4:])
            # Heading 3
            if pdf.h - pdf.b_margin - pdf.get_y() < 20:
                pdf.add_page()
            else:
                pdf.ln(1)

            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(50, 50, 50)
            pdf.cell(0, 5, title, new_x="LMARGIN", new_y="NEXT")

        elif raw_line.startswith("- ") or raw_line.startswith("* "):
            bullet_text = pdf.clean_markdown_line(raw_line[2:])
            if pdf.h - pdf.b_margin - pdf.get_y() < 12:
                pdf.add_page()
            pdf.add_bullet_point(bullet_text)

        elif raw_line == "---":
            # Divider
            if pdf.h - pdf.b_margin - pdf.get_y() > 15:
                pdf.ln(2)
                pdf.set_draw_color(220, 220, 220)
                pdf.set_line_width(0.2)
                pdf.line(15, pdf.get_y(), 195, pdf.get_y())
                pdf.ln(2)

        else:
            # Regular paragraph text
            clean_text = pdf.clean_markdown_line(raw_line)
            if not clean_text:
                continue

            if pdf.h - pdf.b_margin - pdf.get_y() < 15:
                pdf.add_page()

            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(*pdf.color_text)
            # Support rich text paragraphs
            pdf.write_rich_text(clean_text, h=5)
            pdf.ln(6)

    # Save the output
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    pdf.output(pdf_path)
    print(f"Resume PDF compiled successfully and saved at: {pdf_path}")

if __name__ == "__main__":
    compile_resume("resume/resume.md", "resume/my_resume.pdf")
