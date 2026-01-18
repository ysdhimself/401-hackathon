"""
LaTeX Resume Generator
Generates a LaTeX document from MasterResume data
"""


import unicodedata


def _sanitize_text(text: str) -> str:
    """Normalize unicode and remove problematic whitespace."""
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKC", text)
    replacements = {
        "\u00a0": " ",
        "\u200b": "",
        "\u200c": "",
        "\u200d": "",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2022": "•",
    }
    for old, new in replacements.items():
        normalized = normalized.replace(old, new)
    return normalized


def escape_latex(text, aggressive=False):
    """Escape special LaTeX characters."""
    if not text or text is None:
        return ""
    
    try:
        text = str(text)
        text = _sanitize_text(text)
        if not text:
            return ""
        
        # For imported resumes, use aggressive mode to avoid LaTeX errors
        if aggressive:
            sanitized = _aggressive_sanitize(text)
            if not sanitized:
                return ""
            return sanitized.replace('&', r'\&').replace('%', r'\%').replace('$', r'\$').replace('#', r'\#').replace('_', r'\_')
        
        # IMPORTANT: Escape backslash FIRST, before other replacements add backslashes
        text = text.replace('\\', ' ')  # Just replace with space to avoid issues
        
        # Remove braces entirely to prevent unmatched brace errors
        text = text.replace('{', '').replace('}', '')
        
        # Now escape other special characters
        replacements = [
            ('&', r'\&'),
            ('%', r'\%'),
            ('$', r'\$'),
            ('#', r'\#'),
            ('_', r'\_'),
            ('~', ' '),
            ('^', ' '),
            ('•', ''),  # Already stripped by sanitizer
            ('–', '-'),
            ('—', '-'),
            ('(', ''),  # Remove parens to avoid issues
            (')', ''),
        ]
        
        for old, new in replacements:
            text = text.replace(old, new)
        return text if text else ""
    except Exception:
        return ""


def _aggressive_sanitize(text) -> str:
    """Nuclear option: strip everything except alphanumeric and basic punctuation."""
    if not text or text is None:
        return ""
    
    # Convert to string if needed
    text = str(text)
    
    # First normalize unicode
    text = _sanitize_text(text)
    
    # Allow only: letters, numbers, spaces, and basic punctuation
    allowed = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,-:;!?/')
    cleaned = ''.join(c if c in allowed else ' ' for c in text)
    
    # Clean up multiple spaces
    cleaned = ' '.join(cleaned.split())
    
    return cleaned if cleaned else ""


def _escape_resume_item(text) -> str:
    """Extra-sanitize list items to avoid LaTeX brace/backslash issues."""
    if not text or text is None:
        return ""
    
    try:
        # Use aggressive sanitization for bullet items
        cleaned = _aggressive_sanitize(text)
        
        if not cleaned:
            return ""
        
        # Now escape for LaTeX (much simpler since we stripped all special chars)
        # Only need to escape the few LaTeX special chars that remain
        result = cleaned.replace('&', r'\&').replace('%', r'\%').replace('$', r'\$').replace('#', r'\#').replace('_', r'\_')
        
        return result if result else ""
    except Exception:
        return ""


def generate_latex_resume(resume):
    """Generate LaTeX code from a MasterResume object."""
    
    try:
        # Use aggressive sanitization for all fields with safety checks
        full_name = _aggressive_sanitize(resume.full_name) if hasattr(resume, 'full_name') and resume.full_name else "Name"
        phone = _aggressive_sanitize(resume.phone) if hasattr(resume, 'phone') and resume.phone else ""
        email = resume.email if hasattr(resume, 'email') and resume.email else ""  # Keep email as-is for href
        location = _aggressive_sanitize(resume.location) if hasattr(resume, 'location') and resume.location else ""
        linkedin = resume.linkedin_url if hasattr(resume, 'linkedin_url') else ""
        github = resume.github_url if hasattr(resume, 'github_url') else ""
        portfolio = resume.portfolio_url if hasattr(resume, 'portfolio_url') else ""
        summary = _aggressive_sanitize(resume.summary) if hasattr(resume, 'summary') and resume.summary else ""
    except Exception as e:
        # Fallback to safe defaults if anything fails
        full_name = "Name"
        phone = email = location = linkedin = github = portfolio = summary = ""
    
    # Build header
    contact_parts = []
    if phone:
        contact_parts.append(phone)
    if email:
        # Keep email simple - just display it
        contact_parts.append(f"\\href{{mailto:{email}}}{{\\underline{{{email}}}}}")
    if linkedin:
        linkedin_display = linkedin.replace('https://', '').replace('http://', '').split('/')[0]
        contact_parts.append(f"\\href{{{linkedin}}}{{\\underline{{{linkedin_display}}}}}")
    if github:
        github_display = github.replace('https://', '').replace('http://', '').split('/')[0]
        contact_parts.append(f"\\href{{{github}}}{{\\underline{{{github_display}}}}}")
    if portfolio:
        portfolio_display = portfolio.replace('https://', '').replace('http://', '').split('/')[0]
        contact_parts.append(f"\\href{{{portfolio}}}{{\\underline{{{portfolio_display}}}}}")
    
    contact_line = " | ".join(contact_parts)
    
    # Start building the document
    latex = r"""%-------------------------
% Resume in Latex
% Auto-generated from Job Application Tracker
% Based on template by Jake Gutierrez
% License : MIT
%------------------------

\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\pdfgentounicode=1

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
                # Use aggressive sanitization
                title = _aggressive_sanitize(entry.title) if entry.title else ""
                org = _aggressive_sanitize(entry.organization) if entry.organization else ""
                loc = _aggressive_sanitize(entry.location) if entry.location else ""
                start = _aggressive_sanitize(entry.start_date) if entry.start_date else ""
                end = _aggressive_sanitize(entry.end_date) if entry.end_date else ""
                dates = f"{start} -- {end}" if start and end else (start or end)
                
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
                # Use aggressive sanitization
                title = _aggressive_sanitize(entry.title) if entry.title else ""
                org = _aggressive_sanitize(entry.organization) if entry.organization else ""
                loc = _aggressive_sanitize(entry.location) if entry.location else ""
                start = _aggressive_sanitize(entry.start_date) if entry.start_date else ""
                end = _aggressive_sanitize(entry.end_date) if entry.end_date else "Present"
                dates = f"{start} -- {end}"
                desc = entry.description
                
                latex += f"\n    \\resumeSubheading\n"
                latex += f"      {{{title}}}{{{dates}}}\n"
                latex += f"      {{{org}}}{{{loc}}}\n"
                
                if desc:
                    # Pre-process bullets to see if we have any valid ones
                    valid_items = []
                    for line in desc.strip().split('\n'):
                        line = line.strip()
                        if line:
                            # Remove bullet points if already present
                            if line.startswith('- ') or line.startswith('* ') or line.startswith('• '):
                                line = line[2:].strip()
                            if line:  # Only add non-empty lines
                                safe_line = _escape_resume_item(line)
                                if safe_line:  # Double-check it's not empty after sanitization
                                    valid_items.append(safe_line)
                    
                    # Only add itemize environment if we have items
                    if valid_items:
                        latex += "      \\resumeItemListStart\n"
                        for item in valid_items:
                            latex += f"        \\resumeItem{{{item}}}\n"
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
                # Use aggressive sanitization for all fields
                title = _aggressive_sanitize(entry.title) if entry.title else ""
                tech = _aggressive_sanitize(entry.technologies) if entry.technologies else ""
                start = _aggressive_sanitize(entry.start_date) if entry.start_date else ""
                end = _aggressive_sanitize(entry.end_date) if entry.end_date else "Present"
                dates = f"{start} -- {end}" if start else ""
                desc = entry.description
                
                project_header = f"\\textbf{{{title}}}" if title else ""
                if tech and project_header:
                    project_header += f" | \\emph{{{tech}}}"
                elif tech:
                    project_header = f"\\emph{{{tech}}}"
                
                if project_header:  # Only add if we have something to show
                    latex += f"      \\resumeProjectHeading\n"
                    latex += f"          {{{project_header}}}{{{dates}}}\n"
                
                if desc:
                    # Pre-process bullets to see if we have any valid ones
                    valid_items = []
                    for line in desc.strip().split('\n'):
                        line = line.strip()
                        if line:
                            if line.startswith('- ') or line.startswith('* ') or line.startswith('• '):
                                line = line[2:].strip()
                            if line:  # Only add non-empty lines
                                safe_line = _escape_resume_item(line)
                                if safe_line:  # Double-check it's not empty after sanitization
                                    valid_items.append(safe_line)
                    
                    # Only add itemize environment if we have items
                    if valid_items:
                        latex += "          \\resumeItemListStart\n"
                        for item in valid_items:
                            latex += f"            \\resumeItem{{{item}}}\n"
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
                # Use aggressive sanitization
                title = _aggressive_sanitize(entry.title) if entry.title else ""
                skills_text = _aggressive_sanitize(entry.technologies) if entry.technologies else ""
                if title and skills_text:
                    skill_lines.append(f"     \\textbf{{{title}}}{{: {skills_text}}}")
                elif skills_text:
                    skill_lines.append(f"     {skills_text}")
                elif title:
                    skill_lines.append(f"     {title}")
        
        if skill_lines:
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
