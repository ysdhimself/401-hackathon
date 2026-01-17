"""
LaTeX Resume Generator
Generates a LaTeX document from MasterResume data
"""


def escape_latex(text):
    """Escape special LaTeX characters."""
    if not text:
        return ""
    
    replacements = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\^{}',
        '\\': r'\textbackslash{}',
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def generate_latex_resume(resume):
    """Generate LaTeX code from a MasterResume object."""
    
    # Escape all text fields
    full_name = escape_latex(resume.full_name)
    phone = escape_latex(resume.phone)
    email = escape_latex(resume.email)
    location = escape_latex(resume.location)
    linkedin = resume.linkedin_url or ""
    github = resume.github_url or ""
    portfolio = resume.portfolio_url or ""
    summary = escape_latex(resume.summary)
    
    # Build header
    contact_parts = []
    if phone:
        contact_parts.append(phone)
    if email:
        contact_parts.append(f"\\href{{mailto:{email}}}{{\\underline{{{email}}}}}")
    if linkedin:
        linkedin_display = linkedin.replace('https://', '').replace('http://', '')
        contact_parts.append(f"\\href{{{linkedin}}}{{\\underline{{{escape_latex(linkedin_display)}}}}}")
    if github:
        github_display = github.replace('https://', '').replace('http://', '')
        contact_parts.append(f"\\href{{{github}}}{{\\underline{{{escape_latex(github_display)}}}}}")
    if portfolio:
        portfolio_display = portfolio.replace('https://', '').replace('http://', '')
        contact_parts.append(f"\\href{{{portfolio}}}{{\\underline{{{escape_latex(portfolio_display)}}}}}")
    
    contact_line = " $|$ ".join(contact_parts)
    
    # Start building the document
    latex = r"""%-------------------------
% Resume in Latex
% Auto-generated from Job Application Tracker
% Based on template by Jake Gutierrez
% License : MIT
%------------------------

\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage[margin=0.75in]{geometry}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{document}

%----------HEADING----------
\begin{center}
""" + f"    \\textbf{{\\Huge \\scshape {full_name}}} \\\\ \\vspace{{1pt}}\n"
    
    if contact_line:
        latex += f"    \\small {contact_line}\n"
    
    latex += "\\end{center}\n\n"
    
    # Add summary if present
    if summary:
        latex += f"""%-----------SUMMARY-----------
\\section{{Professional Summary}}
{summary}

"""
    
    # Process sections
    sections_by_type = {}
    for section in resume.sections.all().order_by('order'):
        sections_by_type.setdefault(section.section_type, []).append(section)
    
    # Education section
    if 'education' in sections_by_type:
        latex += """%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
"""
        for section in sections_by_type['education']:
            for entry in section.entries.filter(is_active=True).order_by('order', '-start_date'):
                title = escape_latex(entry.title)  # Degree
                org = escape_latex(entry.organization)  # School
                loc = escape_latex(entry.location)
                dates = f"{escape_latex(entry.start_date)} -- {escape_latex(entry.end_date)}" if entry.start_date else ""
                
                latex += f"    \\resumeSubheading\n"
                latex += f"      {{{org}}}{{{loc}}}\n"
                latex += f"      {{{title}}}{{{dates}}}\n"
        
        latex += "  \\resumeSubHeadingListEnd\n\n"
    
    # Experience section
    if 'experience' in sections_by_type:
        latex += """%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
"""
        for section in sections_by_type['experience']:
            for entry in section.entries.filter(is_active=True).order_by('order', '-start_date'):
                title = escape_latex(entry.title)  # Job title
                org = escape_latex(entry.organization)  # Company
                loc = escape_latex(entry.location)
                dates = f"{escape_latex(entry.start_date)} -- {escape_latex(entry.end_date or 'Present')}"
                desc = entry.description
                
                latex += f"\n    \\resumeSubheading\n"
                latex += f"      {{{title}}}{{{dates}}}\n"
                latex += f"      {{{org}}}{{{loc}}}\n"
                
                if desc:
                    latex += "      \\resumeItemListStart\n"
                    # Split description by newlines for bullet points
                    for line in desc.strip().split('\n'):
                        line = line.strip()
                        if line:
                            # Remove bullet points if already present
                            if line.startswith('- ') or line.startswith('* '):
                                line = line[2:]
                            latex += f"        \\resumeItem{{{escape_latex(line)}}}\n"
                    latex += "      \\resumeItemListEnd\n"
        
        latex += "\n  \\resumeSubHeadingListEnd\n\n"
    
    # Projects section
    if 'projects' in sections_by_type:
        latex += """%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
"""
        for section in sections_by_type['projects']:
            for entry in section.entries.filter(is_active=True).order_by('order'):
                title = escape_latex(entry.title)
                tech = escape_latex(entry.technologies) if entry.technologies else ""
                dates = f"{escape_latex(entry.start_date)} -- {escape_latex(entry.end_date or 'Present')}" if entry.start_date else ""
                desc = entry.description
                
                project_header = f"\\textbf{{{title}}}"
                if tech:
                    project_header += f" $|$ \\emph{{{tech}}}"
                
                latex += f"      \\resumeProjectHeading\n"
                latex += f"          {{{project_header}}}{{{dates}}}\n"
                
                if desc:
                    latex += "          \\resumeItemListStart\n"
                    for line in desc.strip().split('\n'):
                        line = line.strip()
                        if line:
                            if line.startswith('- ') or line.startswith('* '):
                                line = line[2:]
                            latex += f"            \\resumeItem{{{escape_latex(line)}}}\n"
                    latex += "          \\resumeItemListEnd\n"
        
        latex += "    \\resumeSubHeadingListEnd\n\n"
    
    # Skills section
    if 'skills' in sections_by_type:
        latex += """%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
"""
        skill_lines = []
        for section in sections_by_type['skills']:
            for entry in section.entries.filter(is_active=True).order_by('order'):
                title = escape_latex(entry.title)
                desc = escape_latex(entry.description) if entry.description else ""
                if desc:
                    skill_lines.append(f"     \\textbf{{{title}}}{{: {desc}}}")
                else:
                    skill_lines.append(f"     {title}")
        
        latex += " \\\\\n".join(skill_lines)
        latex += "\n    }}\n \\end{itemize}\n\n"
    
    # Certifications section
    if 'certifications' in sections_by_type:
        latex += """%-----------CERTIFICATIONS-----------
\\section{Certifications}
  \\resumeSubHeadingListStart
"""
        for section in sections_by_type['certifications']:
            for entry in section.entries.filter(is_active=True).order_by('order'):
                title = escape_latex(entry.title)
                org = escape_latex(entry.organization)
                date = escape_latex(entry.end_date or entry.start_date) if (entry.end_date or entry.start_date) else ""
                
                latex += f"    \\resumeSubheading\n"
                latex += f"      {{{title}}}{{{date}}}\n"
                latex += f"      {{{org}}}{{}}\n"
        
        latex += "  \\resumeSubHeadingListEnd\n\n"
    
    # Awards section
    if 'awards' in sections_by_type:
        latex += """%-----------AWARDS-----------
\\section{Awards \\& Achievements}
  \\resumeSubHeadingListStart
"""
        for section in sections_by_type['awards']:
            for entry in section.entries.filter(is_active=True).order_by('order'):
                title = escape_latex(entry.title)
                org = escape_latex(entry.organization) if entry.organization else ""
                date = escape_latex(entry.end_date or entry.start_date) if (entry.end_date or entry.start_date) else ""
                desc = escape_latex(entry.description) if entry.description else ""
                
                latex += f"    \\resumeSubheading\n"
                latex += f"      {{{title}}}{{{date}}}\n"
                if org or desc:
                    latex += f"      {{{org if org else desc}}}{{}}\n"
        
        latex += "  \\resumeSubHeadingListEnd\n\n"
    
    # Custom sections
    if 'custom' in sections_by_type:
        for section in sections_by_type['custom']:
            section_title = escape_latex(section.section_title)
            latex += f"""%-----------{section_title.upper()}-----------
\\section{{{section_title}}}
  \\resumeSubHeadingListStart
"""
            for entry in section.entries.filter(is_active=True).order_by('order'):
                title = escape_latex(entry.title)
                org = escape_latex(entry.organization) if entry.organization else ""
                date = f"{escape_latex(entry.start_date)} -- {escape_latex(entry.end_date or 'Present')}" if entry.start_date else ""
                
                latex += f"    \\resumeSubheading\n"
                latex += f"      {{{title}}}{{{date}}}\n"
                latex += f"      {{{org}}}{{}}\n"
            
            latex += "  \\resumeSubHeadingListEnd\n\n"
    
    # End document
    latex += """%-------------------------------------------
\\end{document}
"""
    
    return latex
