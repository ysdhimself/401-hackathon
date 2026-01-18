"""
HTML Resume Generator
Generates an HTML document from MasterResume data that can be converted to PDF
"""

def generate_html_resume(resume):
    """Generate HTML from a MasterResume object."""
    
    # Get data safely
    full_name = resume.full_name if resume.full_name else "Name"
    phone = resume.phone if resume.phone else ""
    email = resume.email if resume.email else ""
    location = resume.location if resume.location else ""
    linkedin = resume.linkedin_url if hasattr(resume, 'linkedin_url') else ""
    github = resume.github_url if hasattr(resume, 'github_url') else ""
    portfolio = resume.portfolio_url if hasattr(resume, 'portfolio_url') else ""
    summary = resume.summary if resume.summary else ""
    base_font_size = getattr(resume, 'base_font_size', 11)
    
    # Calculate relative sizes based on base font
    heading_size = base_font_size + 7  # e.g., 11pt base -> 18pt heading
    section_title_size = base_font_size + 1  # e.g., 11pt base -> 12pt sections
    contact_size = base_font_size - 1  # e.g., 11pt base -> 10pt contact
    
    # Build contact line
    contact_parts = []
    if phone:
        contact_parts.append(phone)
    if email:
        contact_parts.append(f'<a href="mailto:{email}">{email}</a>')
    if linkedin:
        linkedin_display = linkedin.replace('https://', '').replace('http://', '')
        contact_parts.append(f'<a href="{linkedin}">{linkedin_display}</a>')
    if github:
        github_display = github.replace('https://', '').replace('http://', '')
        contact_parts.append(f'<a href="{github}">{github_display}</a>')
    if portfolio:
        portfolio_display = portfolio.replace('https://', '').replace('http://', '')
        contact_parts.append(f'<a href="{portfolio}">{portfolio_display}</a>')
    
    contact_line = " | ".join(contact_parts)
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{full_name} - Resume</title>
    <style>
        @page {{
            size: letter;
            margin: 0.5in;
        }}
        body {{
            font-family: Times, serif;
            font-size: {base_font_size}pt;
            line-height: 1.3;
            color: black;
            margin: 0;
            padding: 0;
        }}
        .header {{
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid black;
        }}
        h1 {{
            margin: 0 0 5px 0;
            font-size: {heading_size}pt;
            font-weight: bold;
        }}
        .contact {{
            font-size: {contact_size}pt;
            margin: 5px 0 0 0;
        }}
        .contact a {{
            color: black;
            text-decoration: underline;
        }}
        .section {{
            margin: 8px 0;
        }}
        .section-title {{
            font-size: {section_title_size}pt;
            font-weight: bold;
            margin: 8px 0 5px 0;
            border-bottom: 1px solid black;
            padding-bottom: 2px;
        }}
        .entry {{
            margin: 5px 0 8px 0;
        }}
        .entry-header {{
            margin-bottom: 2px;
        }}
        .entry-title {{
            font-weight: bold;
        }}
        .entry-subtitle {{
            font-style: italic;
        }}
        .entry-date {{
            font-style: italic;
            float: right;
        }}
        .entry-details ul {{
            margin: 3px 0 0 20px;
            padding: 0;
        }}
        .entry-details li {{
            margin: 2px 0;
        }}
        .skills {{
            margin: 5px 0;
        }}
        .skill-category {{
            margin: 3px 0;
        }}
        strong {{
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{full_name.upper()}</h1>
        <div class="contact">{contact_line}</div>
    </div>
"""
    
    if summary:
        html += f"""
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p>{summary}</p>
    </div>
"""
    
    # Process sections
    sections_by_type = {}
    for section in resume.sections.all().order_by('order'):
        sections_by_type.setdefault(section.section_type, []).append(section)
    
    # Education
    if 'education' in sections_by_type:
        html += """
    <div class="section">
        <div class="section-title">Education</div>
"""
        for section in sections_by_type['education']:
            for entry in section.entries.filter(is_active=True).order_by('order', '-start_date'):
                org = entry.organization or ''
                loc = entry.location or ''
                title = entry.title or ''
                start = entry.start_date or ''
                end = entry.end_date or ''
                dates = f"{start} -- {end}" if start and end else (start or end)
                desc = entry.description or ''
                
                html += f"""
        <div class="entry">
            <div class="entry-header">
                <span class="entry-date">{dates}</span>
                <span class="entry-title">{org}</span>
                {f'<span class="entry-subtitle"> - {loc}</span>' if loc else ''}
            </div>
            <div class="entry-subtitle">{title}</div>
"""
                if desc:
                    bullets = [line.strip() for line in desc.split('\n') if line.strip()]
                    if bullets:
                        html += '            <div class="entry-details"><ul>\n'
                        for bullet in bullets:
                            # Remove bullet if present
                            if bullet.startswith('- ') or bullet.startswith('* ') or bullet.startswith('• '):
                                bullet = bullet[2:].strip()
                            if bullet:
                                html += f'                <li>{bullet}</li>\n'
                        html += '            </ul></div>\n'
                
                html += '        </div>\n'
        
        html += '    </div>\n'
    
    # Experience
    if 'experience' in sections_by_type:
        html += """
    <div class="section">
        <div class="section-title">Experience</div>
"""
        for section in sections_by_type['experience']:
            for entry in section.entries.filter(is_active=True).order_by('order', '-start_date'):
                title = entry.title or ''
                org = entry.organization or ''
                loc = entry.location or ''
                start = entry.start_date or ''
                end = entry.end_date or 'Present'
                dates = f"{start} -- {end}"
                desc = entry.description or ''
                
                html += f"""
        <div class="entry">
            <div class="entry-header">
                <span class="entry-date">{dates}</span>
                <span class="entry-title">{title}</span>
                {f'<span class="entry-subtitle"> - {org}, {loc}</span>' if org else ''}
            </div>
"""
                if desc:
                    bullets = [line.strip() for line in desc.split('\n') if line.strip()]
                    if bullets:
                        html += '            <div class="entry-details"><ul>\n'
                        for bullet in bullets:
                            if bullet.startswith('- ') or bullet.startswith('* ') or bullet.startswith('• '):
                                bullet = bullet[2:].strip()
                            if bullet:
                                html += f'                <li>{bullet}</li>\n'
                        html += '            </ul></div>\n'
                
                html += '        </div>\n'
        
        html += '    </div>\n'
    
    # Projects
    if 'projects' in sections_by_type:
        html += """
    <div class="section">
        <div class="section-title">Projects</div>
"""
        for section in sections_by_type['projects']:
            for entry in section.entries.filter(is_active=True).order_by('order'):
                title = entry.title or ''
                tech = entry.technologies or ''
                start = entry.start_date or ''
                end = entry.end_date or 'Present'
                dates = f"{start} -- {end}" if start else ''
                desc = entry.description or ''
                
                html += f"""
        <div class="entry">
            <div class="entry-header">
                <span class="entry-date">{dates}</span>
                <span class="entry-title">{title}</span>
                {f'<span class="entry-subtitle"> | {tech}</span>' if tech else ''}
            </div>
"""
                if desc:
                    bullets = [line.strip() for line in desc.split('\n') if line.strip()]
                    if bullets:
                        html += '            <div class="entry-details"><ul>\n'
                        for bullet in bullets:
                            if bullet.startswith('- ') or bullet.startswith('* ') or bullet.startswith('• '):
                                bullet = bullet[2:].strip()
                            if bullet:
                                html += f'                <li>{bullet}</li>\n'
                        html += '            </ul></div>\n'
                
                html += '        </div>\n'
        
        html += '    </div>\n'
    
    # Skills
    if 'skills' in sections_by_type:
        html += """
    <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills">
"""
        for section in sections_by_type['skills']:
            for entry in section.entries.filter(is_active=True).order_by('order'):
                title = entry.title or ''
                skills = entry.technologies or ''
                if title and skills:
                    html += f'            <div class="skill-category"><strong>{title}:</strong> {skills}</div>\n'
                elif skills:
                    html += f'            <div class="skill-category">{skills}</div>\n'
        
        html += '        </div>\n'
        html += '    </div>\n'
    
    html += """
</body>
</html>
"""
    
    return html
