const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat,
  TabStopType, TabStopPosition, UnderlineType, SimpleField
} = require('docx');
const fs = require('fs');

// ─── Colour palette ───────────────────────────────────────────────────────────
const GREEN  = "1A7A4A";   // heading green (like specimen's blue accent)
const NAVY   = "1B2A4A";   // dark navy for title block
const LIGHT_GREEN = "E8F5EE"; // table header bg
const MID_GREEN   = "C8E6D4";
const WHITE  = "FFFFFF";
const GRAY   = "F2F2F2";

// ─── Border helpers ───────────────────────────────────────────────────────────
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const allBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorder   = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders  = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: NAVY })],
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 4 } }
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 26, font: "Arial", color: GREEN })],
    spacing: { before: 300, after: 120 }
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: NAVY })],
    spacing: { before: 240, after: 100 }
  });
}
function h4(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial", underline: { type: UnderlineType.SINGLE } })],
    spacing: { before: 200, after: 80 }
  });
}
function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 120, line: 276 },
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })]
  });
}
function bold(text) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial" })]
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}
function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 40, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}
function emptyLine(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: 0 } }));
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// RED placeholder block for diagrams/screenshots
function placeholder(description) {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: "CC0000" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "CC0000" },
      left: { style: BorderStyle.SINGLE, size: 6, color: "CC0000" },
      right: { style: BorderStyle.SINGLE, size: 6, color: "CC0000" }
    },
    shading: { fill: "FFF0F0", type: ShadingType.CLEAR },
    children: [
      new TextRun({ text: "[INSERT IMAGE: " + description + "]", bold: true, color: "CC0000", size: 20, font: "Arial" })
    ]
  });
}

// Table caption
function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 160 },
    children: [new TextRun({ text, italic: true, size: 20, font: "Arial", color: "555555" })]
  });
}

// Simple 2-col header table
function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: allBorders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: "Arial" })] })]
    }))
  });
  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders: allBorders,
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? WHITE : GRAY, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial" })] })]
    }))
  }));
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

// ─── DOCUMENT ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: GREEN },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            spacing: { before: 0, after: 60 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GREEN, space: 4 } },
            children: [
              new TextRun({ text: "Masvingo Poly Clinical Portal  |  Technical Documentation", size: 18, font: "Arial", color: "888888", italics: true })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: GREEN, space: 4 } },
            spacing: { before: 60 },
            children: [
              new TextRun({ text: "Memory Mufambi  |  Masvingo Polytechnic  |  March 2026        Page ", size: 18, font: "Arial", color: "888888" }),
              new SimpleField({ instrText: "PAGE", cachedValue: "1" })
            ]
          })
        ]
      })
    },
    children: [

      // ═══════════════════ COVER PAGE ═══════════════════════════════════════
      ...emptyLine(4),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "MASVINGO POLYTECHNIC", bold: true, size: 56, font: "Arial", color: NAVY })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Department of Information Technology", size: 28, font: "Arial", color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 6 } },
        spacing: { before: 80, after: 200 },
        children: [new TextRun("")]
      }),
      ...emptyLine(2),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "TECHNICAL DOCUMENTATION", bold: true, size: 40, font: "Arial", color: NAVY })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "MASVINGO POLY CLINICAL PORTAL", bold: true, size: 36, font: "Arial", color: GREEN })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "A Web-Based Clinical Management System for Masvingo Polytechnic", italics: true, size: 24, font: "Arial", color: "555555" })]
      }),
      ...emptyLine(4),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Prepared By:", bold: true, size: 24, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Memory Mufambi", size: 24, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Date: March 2026", size: 24, font: "Arial" })]
      }),
      pageBreak(),

      // ═══════════════════ ABSTRACT ════════════════════════════════════════
      h1("ABSTRACT"),
      para("This project documentation presents the Masvingo Poly Clinical Portal, a web-based clinical management system designed to modernise and centralise health services at Masvingo Polytechnic. The platform incorporates a range of features including a real-time clinical intake queue, pharmacy inventory and dispensary management, a personal medical records vault, an online appointment booking system, a sick note application and approval workflow, and a confidential Mental Wellness Hub. The system is built using a modern, serverless architecture comprising React, TypeScript, Firebase (Firestore and Authentication), and Tailwind CSS, accessible from any device through a web browser."),
      para("The documentation provides a comprehensive description of the platform's development lifecycle, covering analysis, design, development, testing, and implementation. User surveys indicated that over 88% of students expressed frustration with the existing manual system, and over 90% confirmed they would use an online appointment booking facility if available. The results of testing confirm that the platform effectively addresses every identified shortcoming of the current paper-based system, with the potential to substantially improve the delivery of healthcare services for the entire Masvingo Polytechnic community."),
      pageBreak(),

      // ═══════════════════ DECLARATION ═════════════════════════════════════
      h1("DECLARATION"),
      para("I, Memory Mufambi, do hereby declare that I am the sole author of this technical documentation and the system described herein. I authorise Masvingo Polytechnic to make reference to this documentation for the purpose of institutional records, scholarly review, and future development of the system."),
      ...emptyLine(2),
      para("Signature:  ………………………………………………………     Date:  ……………………………"),
      pageBreak(),

      // ═══════════════════ ACKNOWLEDGEMENTS ════════════════════════════════
      h1("ACKNOWLEDGEMENTS"),
      para("The successful completion of this project would not have been possible without the support and contributions of a number of individuals."),
      para("A special thank you is extended to Dr. Nyoni, Chief Medical Officer at Masvingo Polytechnic, whose clinical expertise, patience, and willingness to explain the day-to-day realities of managing the clinic's operations were absolutely fundamental to the design and development of this system. The insights shared by Dr. Nyoni were the foundation upon which every functional requirement of this portal was built."),
      para("Sincere gratitude is also expressed to the students and faculty members of Masvingo Polytechnic who participated in user feedback sessions and questionnaires. Their candid perspectives on the patient experience were instrumental in shaping the system's most critical features, including the online appointment booking system, the medical documents vault, and the confidential Mental Wellness Hub."),
      para("Finally, deep appreciation is extended to the global open-source community whose tools — particularly React, Firebase, and Tailwind CSS — made the development of this platform both possible and cost-effective."),
      pageBreak(),

      // ═══════════════════ DEDICATION ══════════════════════════════════════
      h1("DEDICATION"),
      para("This work is dedicated to every student and member of faculty at Masvingo Polytechnic who deserves access to efficient, dignified, and private healthcare services. It is also dedicated to all those who believe that technology, when purposefully applied, can meaningfully improve lives."),
      pageBreak(),

      // ═══════════════════ TABLE OF CONTENTS ═══════════════════════════════
      h1("TABLE OF CONTENTS"),
      para("ABSTRACT ................................................................................................................................... i"),
      para("DECLARATION .......................................................................................................................... ii"),
      para("ACKNOWLEDGEMENTS .......................................................................................................... iii"),
      para("DEDICATION ............................................................................................................................ iv"),
      para("List of Acronyms ........................................................................................................................ vi"),
      para("List of Tables .............................................................................................................................. vii"),
      para("List of Figures ........................................................................................................................... viii"),
      para("Chapter 1: Introduction ................................................................................................................ 1"),
      para("Chapter 2: Planning Phase ............................................................................................................ 6"),
      para("Chapter 3: Analysis Phase .......................................................................................................... 15"),
      para("Chapter 4: Design Phase ............................................................................................................ 25"),
      para("Chapter 5: Implementation Phase .............................................................................................. 38"),
      para("References ................................................................................................................................. 48"),
      para("Appendices ................................................................................................................................. 49"),
      pageBreak(),

      // ═══════════════════ LIST OF ACRONYMS ════════════════════════════════
      h1("List of Acronyms"),
      makeTable(
        ["Acronym", "Full Meaning"],
        [
          ["API","Application Programming Interface"],
          ["CBA","Cost Benefit Analysis"],
          ["DFD","Data Flow Diagram"],
          ["EER","Extended Entity Relationship"],
          ["FERPA","Family Educational Rights and Privacy Act"],
          ["HIPAA","Health Insurance Portability and Accountability Act"],
          ["HMR","Hot Module Replacement"],
          ["IDE","Integrated Development Environment"],
          ["JSON","JavaScript Object Notation"],
          ["MasPoly","Masvingo Polytechnic"],
          ["NoSQL","Not Only Structured Query Language"],
          ["NPV","Net Present Value"],
          ["RBAC","Role-Based Access Control"],
          ["ROI","Return on Investment"],
          ["SPA","Single-Page Application"],
          ["SSL/TLS","Secure Sockets Layer / Transport Layer Security"],
          ["UAT","User Acceptance Testing"],
          ["UML","Unified Modelling Language"],
          ["UX","User Experience"],
        ],
        [2340, 6686]
      ),
      pageBreak(),

      // ═══════════════════ LIST OF TABLES ══════════════════════════════════
      h1("List of Tables"),
      para("2.1  Hardware and Software Requisites ................................................................................... 8"),
      para("2.2  Tangible Benefits ............................................................................................................ 9"),
      para("2.3  Intangible Benefits .......................................................................................................... 9"),
      para("2.4  Development Costs ....................................................................................................... 10"),
      para("2.5  Operational Costs .......................................................................................................... 10"),
      para("2.6  Cost Benefit Analysis .................................................................................................... 11"),
      para("2.7  ROI Calculations ........................................................................................................... 11"),
      para("2.8  Net Present Value .......................................................................................................... 12"),
      para("2.9  Risk Analysis ................................................................................................................ 13"),
      para("2.10 Work Plan ..................................................................................................................... 14"),
      para("3.1  Current System Analysis ............................................................................................... 21"),
      para("4.1  Users Collection ............................................................................................................ 33"),
      para("4.2  Patients Collection ........................................................................................................ 33"),
      para("4.3  Appointments Collection ............................................................................................... 34"),
      para("4.4  Sick Notes Collection .................................................................................................... 34"),
      para("4.5  Pharmacy Items Collection ........................................................................................... 34"),
      para("4.6  Mental Wellness Collection .......................................................................................... 35"),
      pageBreak(),

      // ═══════════════════ LIST OF FIGURES ═════════════════════════════════
      h1("List of Figures"),
      para("1.1  Masvingo Polytechnic Organisational Structure .............................................................. 3"),
      para("2.1  Gantt Chart ..................................................................................................................... 15"),
      para("3.1  Context Diagram (Existing System) ................................................................................ 22"),
      para("3.2  Data Flow Diagram (Existing System) ............................................................................. 23"),
      para("3.3  UML Activity Diagram (Existing System) ....................................................................... 24"),
      para("3.4  Use Case Diagram (Existing System) .............................................................................. 25"),
      para("4.1  Client-Server Architecture Diagram ................................................................................ 28"),
      para("4.2  Context Diagram (Proposed System) ............................................................................... 29"),
      para("4.3  Data Flow Diagram (Proposed System) ........................................................................... 30"),
      para("4.4  UML Activity Diagram (Proposed System) ..................................................................... 31"),
      para("4.5  Use Case Diagram (Proposed System) ............................................................................. 32"),
      para("4.6  Software-Hardware Interaction Diagram .......................................................................... 33"),
      para("4.7  Extended Entity Relationship (EER) Diagram .................................................................. 36"),
      para("4.8  Main Menu Screens ......................................................................................................... 37"),
      para("4.9  Sub-Menu Screens ........................................................................................................... 37"),
      para("4.10 Login and Registration Input Forms ................................................................................ 38"),
      para("4.11 Appointment and Sick Note Input Forms ......................................................................... 38"),
      para("4.12 Admin Dashboard and Pharmacy Output Views ............................................................... 39"),
      para("4.13 Patient Dashboard Output View ....................................................................................... 40"),
      para("5.1  Login Source Code Snippet ............................................................................................. 44"),
      para("5.2  Resultant Login Screen ................................................................................................... 44"),
      para("5.3  Testing Strategies Diagram .............................................................................................. 45"),
      para("5.4  Login Empty Input Fields Test Case ................................................................................ 46"),
      para("5.5  Appointment Booking Empty Input Fields Test Case ....................................................... 46"),
      para("5.6  Invalid Login Credentials Test Case ................................................................................. 47"),
      para("5.7  Pharmacy Dispensing Test Case ....................................................................................... 47"),
      para("5.8  Sick Note Approval Workflow Test Case .......................................................................... 48"),
      para("5.9  Successful Consultation Session Test Case ....................................................................... 48"),
      pageBreak(),

      // ═══════════════════ CHAPTER 1 ═══════════════════════════════════════
      h1("Chapter 1: Introduction"),
      h2("1.1 Introduction"),
      para("Masvingo Polytechnic is amongst the state-owned tertiary institutions in Zimbabwe that provide primary healthcare and wellness services to its student and faculty community through an on-campus clinic. A critical review of this institution's clinical services operation reveals that the management of these services remains entirely manual and paper-based, relying on physical queuing, handwritten records, and disconnected communication channels that have not kept pace with technological advancement."),
      para("The background of the clinical services operation, its vision, and the operational context of Masvingo Polytechnic are communicated in this chapter. Focus has been placed on the institution's existing clinical management instrument, its associated problems, and the objectives of the proposed digital solution designed to overcome those problems."),

      h2("1.2 Background of the Study"),
      para("The increasing complexity of managing student and faculty health services within a growing tertiary institution has placed significant strain on the manual systems employed at Masvingo Polytechnic. The clinic, which operates under the oversight of Dr. Nyoni as Chief Medical Officer, serves a community that expects modern, digital, and self-service access to healthcare management. At present, this expectation goes unmet."),
      para("The manual clinical management system is afflicted by a range of persistent problems including:"),
      bullet("Excessive patient waiting times of between 35 and 50 minutes due to the absence of any appointment or queue management system."),
      bullet("High risk of loss or damage to all patient health records, which exist solely as physical paper files."),
      bullet("Error-prone pharmacy stock management with no automated low-stock alerts, leading to undetected stockouts of critical medications."),
      bullet("Complete absence of patient self-service, meaning students and faculty must physically present at the clinic for even administrative tasks such as obtaining sick notes."),
      bullet("No mechanism to guarantee the privacy of sensitive mental health consultation records, which are stored alongside general medical records."),
      para("Consequently, this project was conceived to develop a tool that eliminates all of these deficiencies. A modern, web-based clinical management system — the Masvingo Poly Clinical Portal — was designed and built to digitise, centralise, and streamline every aspect of the clinic's operations."),

      h3("1.2.1 Background of the Organisation"),
      para("Masvingo Polytechnic is a state-owned technical and vocational institution located in Masvingo, Zimbabwe. The polytechnic offers a range of programmes in engineering, business, applied sciences, and information technology, serving a diverse student population. The institution's on-campus clinic provides primary healthcare services to students and staff, operating under the management of a qualified medical officer and supporting clinical staff."),

      h3("1.2.2 Organisational Structure"),
      para("The governance and operational structure of Masvingo Polytechnic flows through its administrative hierarchy from the Principal through academic and administrative departments. The clinic falls under the administrative services division and reports to the institutional administration. The figure below represents the organisational structure of Masvingo Polytechnic."),
      ...emptyLine(1),
      placeholder("Fig 1.1 — ORGANISATIONAL CHART OF MASVINGO POLYTECHNIC. This should be a hierarchical org chart (top-down tree diagram) showing: TOP: Principal; SECOND LEVEL: Vice Principal (Academic) | Vice Principal (Administration); THIRD LEVEL under Academic: Registrar | Heads of Academic Departments (e.g. IT, Engineering, Business, Applied Sciences); THIRD LEVEL under Administration: Finance Officer | Human Resources | Student Affairs | Clinical Services (Dr. Nyoni, CMO); CLINICAL branch further shows: Medical Officer | Pharmacy | Nursing Staff. Use boxes with rounded corners, green (#1A7A4A) colour for borders, navy (#1B2A4A) for text, and connecting lines between all levels."),
      tableCaption("Fig 1.1: Masvingo Polytechnic Organisational Structure."),

      h3("1.2.3 Vision"),
      para("Masvingo Polytechnic's vision is to be a centre of excellence in technical and vocational education, producing competent, innovative, and entrepreneurial graduates who contribute meaningfully to national development and the global knowledge economy."),

      h3("1.2.4 Mission Statement"),
      para("The mission of Masvingo Polytechnic is to provide quality, relevant, and accessible technical and vocational education and training that empowers individuals, transforms communities, and drives sustainable development."),

      h2("1.3 Problem Definition"),
      para("According to Shore and Warden, a problem definition is a specific but not prescriptive description of the challenge the project will address, leaving room for the development team to work out the details. In this context, the core problem is the operational inefficiency and data insecurity arising from the entirely manual management of clinical services at Masvingo Polytechnic. There exists a significant gap between the healthcare services the clinic provides and the ability of both staff and patients to access, manage, and act on clinical information in a timely and secure manner. Physical unavailability at the clinic, or the absence of administrative staff, results in patients being unable to access their own medical records, book appointments, obtain sick notes, or engage with mental wellness support resources."),

      h2("1.4 Aim"),
      para("The Masvingo Poly Clinical Portal aims to eliminate the identified problems by providing an all-round, minimum-human-resourced, web-based platform that bridges the gap between the clinic's services and the students, faculty, and medical staff who depend on them. A modern digital environment where clinical intake, pharmacy management, medical record access, appointment booking, sick note workflows, and confidential mental wellness support can all be managed efficiently and securely from any internet-connected device is the core objective of this project."),

      h2("1.5 Objectives"),
      bullet("To implement a real-time clinical intake queue management system for the medical officer."),
      bullet("To implement a pharmacy inventory control system with automated low-stock alerts and a full dispensary audit ledger."),
      bullet("To implement a personal medical records vault allowing patients to access and download their consultation history and certificates."),
      bullet("To implement an online appointment booking and management system."),
      bullet("To implement a sick note application, approval, and status tracking workflow."),
      bullet("To implement a confidential, FERPA and HIPAA-aligned Mental Wellness Hub with mood check-in, digital journalling, and counselling session management."),

      h2("1.6 Instruments and Methods"),
      para("These address the 'what' and 'how' determinants of the project's success. An instrument is a tool used to gather information or produce an outcome. A method is the process by which the work is executed."),
      para("Instruments employed in this project include:"),
      bullet("Direct Observation. Cleary et al. (2020) describes direct observation as a one-way, non-verbal technique where emphasis is placed on noting, recording, and analysing events as they unfold naturally, without the observer intervening."),
      bullet("Interviews. Cleary et al. (2020) describes an interview as a spoken, face-to-face, two-way communication technique where detailed qualitative feedback, meanings, and feelings can be explored through direct questioning."),
      bullet("Questionnaires. Written, one-way communication instruments with structured questions distributed to a wider audience to gather quantitative and qualitative data at scale."),
      para("Methods employed in this project include:"),
      bullet("Visual Studio Code (VS Code) as the primary code editor, with extensions for TypeScript and React development."),
      bullet("React with TypeScript and Tailwind CSS for frontend user interface development."),
      bullet("Firebase (Firestore, Authentication) as the serverless backend, database, and hosting infrastructure."),
      bullet("Vite as the build tooling platform for rapid development with Hot Module Replacement."),
      bullet("Git and GitHub for version control, using a feature-branch workflow."),
      bullet("Draw.io and Microsoft Word for system diagramming and documentation."),

      h2("1.7 Justification and Rationale"),
      para("With the increasing reliance on digital systems across all sectors, it is entirely justifiable to engineer a web-based platform that modernises and formalises the clinical management operations of Masvingo Polytechnic. The manual system in use is not only inefficient but represents a genuine risk to patient data integrity and privacy. Like every other service sector, healthcare management is now expected to be digital, accessible, and user-centric. The development of the Masvingo Poly Clinical Portal is a direct response to that expectation, grounded in empirical evidence from user surveys and stakeholder interviews."),

      h2("1.8 Conclusion"),
      para("Due to the documented inefficiency of the existing manual clinical management system at Masvingo Polytechnic, a web-based application was designed and developed such that clinical intake, pharmacy management, medical records, appointment scheduling, sick note workflows, and mental wellness support are fully digitised and accessible to all authorised users. This chapter has expressly articulated the problems of the existing system and the objectives of the proposed solution, as well as the development tools and data-gathering instruments employed. The next chapter communicates the planning phase of the project."),
      pageBreak(),

      // ═══════════════════ CHAPTER 2 ═══════════════════════════════════════
      h1("Chapter 2: Planning Phase"),
      h2("2.1 Introduction"),
      para("This planning phase communicates concepts such as the feasibility study, which was executed to assess the viability of the proposed system across its technical, economic, social, and operational dimensions. It conveys the extent to which the system is expected to deliver business value, the risks that were identified and mitigated, the stakeholders involved, and the work plan and timeline governing the development process."),

      h2("2.2 Business Value"),
      para("Organisational success, not merely technical triumph, is the true measure of a project's business value. Business value of the Masvingo Poly Clinical Portal was concentrated on three pillars:"),
      bullet("Patient Satisfaction — By directly involving students and faculty in the requirements-gathering process, the system was designed to deliver features that matter most to the patient community, specifically online booking, self-service access to records, and confidential mental wellness support."),
      bullet("Ease of Clinical Management — Medical staff can now manage the full clinical workflow digitally: the intake queue, pharmacy dispensing, dispensary history, sick note approvals, and patient summaries are all accessible in real time from a single platform, dramatically reducing administrative burden and recording errors."),
      bullet("Institutional Goodwill and Data Security — Project documentation, user manuals, and the underlying system architecture ensure long-term institutional knowledge transfer and data security, protecting the clinic's operational continuity."),

      h2("2.3 Analysis of Feasibility"),
      para("Wiley (2020) reveals the analysis of feasibility as the project's exploration in relation to its technical, economic, social, and operational viability aspects, thereby scaling up its probability of success."),

      h3("2.3.1 Technical Feasibility"),
      para("The system was technically viable from the outset. The proposed technology stack — React, TypeScript, Firebase, and Tailwind CSS — is composed entirely of mature, mainstream, and well-documented technologies. The use of Firebase as a serverless backend completely eliminates the need to purchase, configure, or maintain physical servers, making the solution technically sustainable and scalable."),

      h4("2.3.1.1 Hardware and Software Requisites"),
      para("Performance of the Clinical Portal depends on the availability of standard computing equipment and internet connectivity. The table below describes the recommended configurations for operating the system."),
      makeTable(
        ["Requisite", "Item", "Quantity", "Specs", "Cost (USD)"],
        [
          ["Hardware","Laptop","1","Core i5, 8GB RAM","550"],
          ["Hardware","Mobile device (testing)","1","Android/iOS smartphone","80"],
          ["Hardware","Router","1","Standard Wi-Fi router","40"],
          ["Software","VS Code (IDE)","1","Free, open-source","0"],
          ["Software","Node.js / npm","1","Free, open-source","0"],
          ["Software","Firebase (Firestore/Auth)","1","Free Spark tier initially","0"],
          ["Software","Vercel/Netlify Hosting","1","Free tier (pay-as-you-go)","0"],
          ["Software","GitHub","1","Free for public repositories","0"],
          ["","","","Total","670"],
        ],
        [1800, 2500, 1000, 2200, 900]
      ),
      tableCaption("Table 2.1: Hardware and Software Requisites."),

      h3("2.3.2 Economic Feasibility"),
      para("A deterministic approach was taken to evaluate the economic benefits of the candidate system against its developmental and operational costs. Techniques including Cost Benefit Analysis (CBA), Return on Investment (ROI), Net Present Value (NPV), and payback period analysis were applied."),

      h4("2.3.2.1 Tangible Benefits"),
      para("These benefits can be assigned a measurable monetary value. The table below reflects projected tangible benefits over a three-year period."),
      makeTable(
        ["Benefit", "1st Year (USD)", "2nd Year (USD)", "3rd Year (USD)"],
        [
          ["Reduction in paper/printing costs","600","750","900"],
          ["Reduction in administrative labour hours","1,200","1,500","1,800"],
          ["Prevention of pharmacy stockout losses","1,800","2,200","2,600"],
          ["Improved patient throughput efficiency","900","1,200","1,500"],
          ["Total","4,500","5,650","6,800"],
        ],
        [3240, 1530, 1530, 1530]
      ),
      tableCaption("Table 2.2: Tangible Benefits."),

      h4("2.3.2.2 Intangible Benefits"),
      para("These benefits are subjective and difficult to quantify in monetary terms but are nonetheless strategically significant."),
      bullet("Enhanced patient privacy and dignity through secure, role-based access to health records."),
      bullet("Improved institutional reputation through adoption of modern health information technology."),
      bullet("Reduced student anxiety and improved wellness through 24/7 access to mental health support."),
      bullet("Elimination of the risk of patient data loss due to fire, flooding, or physical deterioration."),

      h4("2.3.2.3 Development Costs"),
      makeTable(
        ["Item", "Specification", "1st Year (USD)", "2nd Year (USD)", "3rd Year (USD)"],
        [
          ["Developer time","1 developer, approx. 400 hrs","0 (internal)","—","—"],
          ["Domain name registration","Custom institutional domain","12","12","12"],
          ["Firebase (if tier exceeded)","Pay-as-you-go usage","0","25","25"],
          ["Total","","12","37","37"],
        ],
        [2500, 2500, 1120, 1120, 1120]
      ),
      tableCaption("Table 2.3 (combined): Development and Software Costs."),

      h4("2.3.2.4 Operational Costs"),
      makeTable(
        ["Expense", "1st Year (USD)", "2nd Year (USD)", "3rd Year (USD)"],
        [
          ["Hosting (Firebase/Vercel free tier)","0","25","25"],
          ["Domain renewal","12","12","12"],
          ["Software upgrades/maintenance","120","150","180"],
          ["Training (one-time)","0","0","0"],
          ["Total (USD)","132","187","217"],
        ],
        [3240, 1530, 1530, 1530]
      ),
      tableCaption("Table 2.4: Operational Costs."),

      h4("2.3.2.5 Cost Benefit Analysis (CBA)"),
      para("If a proposal shows an excess of benefits over costs, it becomes a candidate for further consideration. The CBA indicates a clear and sustained excess of benefits over costs, rendering the project economically viable to pursue."),
      makeTable(
        ["Item / Value (USD)", "1st Year", "2nd Year", "3rd Year"],
        [
          ["Operational + Development costs","144","224","254"],
          ["Tangible benefits","4,500","5,650","6,800"],
          ["Net profit","4,356","5,426","6,546"],
        ],
        [3240, 1953, 1953, 1680]
      ),
      tableCaption("Table 2.5: Cost Benefit Analysis."),

      h4("2.3.2.6 Return on Investment (ROI)"),
      para("ROI gives a means of assessing the net profitability relative to the investment required. Below are the calculated ROI values for each of the first three operational years, all of which are strongly positive."),
      makeTable(
        ["Year", "Net Benefit (USD)", "Total Cost (USD)", "ROI (%)"],
        [
          ["Year 1","4,356","144","3,025%"],
          ["Year 2","5,426","224","2,422%"],
          ["Year 3","6,546","254","2,577%"],
        ],
        [1953, 2340, 2340, 2193]
      ),
      tableCaption("Table 2.6: ROI Calculations."),

      h4("2.3.2.7 Net Present Value (NPV)"),
      para("NPV accounts for both the profitability of the project and the timing of cash flows, applying a discount rate of 10%."),
      makeTable(
        ["Year", "Discount Factor @10%", "Cash Flow (USD)", "Present Value (USD)"],
        [
          ["0","1.000","(670) initial cost","(670)"],
          ["1","0.909","4,356","3,960"],
          ["2","0.826","5,426","4,482"],
          ["3","0.751","6,546","4,918"],
          ["NPV","","","12,690"],
        ],
        [1953, 2340, 2340, 1953]
      ),
      tableCaption("Table 2.7: Net Present Value."),

      h4("2.3.2.8 Payback Period"),
      para("The payback period is the time taken to recover the initial investment. Given the negligible hardware costs and the substantial efficiency gains from day one of deployment, the payback period for this project is estimated at under one month of operation. This renders it the most economically justifiable option among all alternatives evaluated."),

      h3("2.3.3 Social Feasibility"),
      para("Social feasibility explores how the project impacts and is impacted by the society it serves. The intended users of this system are students and faculty of a modern educational institution, a community that is both digitally literate and highly dependent on mobile and web-based tools. The survey findings confirm strong pre-existing demand: over 90% of students indicated they would use an online appointment system, and over 75% cited privacy concerns about mental health records. The system was thus socially primed for acceptance before development had even begun."),

      h3("2.3.4 Operational Feasibility"),
      para("Operational feasibility answers whether the proposed system has the ability to carry out its intended functionalities and meet its core objectives over the long term. The system is designed to digitise and enhance existing clinical workflows rather than disrupt them. The fact-finding study confirmed strong pre-existing demand and willingness to adopt from both clinical staff and patients. Stakeholder feedback during User Acceptance Testing (UAT) confirmed that the system was fit for its intended purpose and that both Dr. Nyoni and the student beta group were satisfied with its functionality and usability."),

      h2("2.4 Risk Analysis"),
      para("Identification of potential project risks with likely negative effects, and the mitigation measures applied, are expressed in the following table."),
      makeTable(
        ["Risk", "Analysis", "Mitigation Measure"],
        [
          ["Security breach / data compromise","Unauthorised users may attempt to access patient health records or pharmacy data.","Role-based access control (RBAC) enforced at both frontend and backend (Firestore Security Rules). All traffic encrypted via HTTPS/SSL. Firebase Authentication handles credential hashing."],
          ["Mental health data privacy violation","Mental wellness records could be accessed by unauthorised administrators or other students.","Firestore Security Rules explicitly restrict the /mentalWellness/ collection to the individual patient only. No administrator can access this data via the API."],
          ["Resistance to change","Clinical staff or students may be reluctant to abandon familiar manual processes.","User involvement in requirements-gathering. Hands-on training for Dr. Nyoni before go-live. Phased onboarding strategy for students."],
          ["Internet/connectivity dependency","System requires internet access, which may be intermittent on campus.","Firebase caches data locally on the client, enabling continued viewing of recently accessed records during brief outages."],
          ["Budget overrun","The project could exceed its estimated costs if Firebase usage exceeds free tier limits.","The system is architected for minimal reads/writes. Free tier thresholds are generously set and monitored. Vercel/Netlify also offer substantial free tiers."],
        ],
        [1500, 2500, 4326]
      ),
      tableCaption("Table 2.8: Risk Analysis."),

      h2("2.5 Stakeholder Analysis"),
      para("Stakeholder analysis identifies all parties with an interest in the system and their expectations. The following stakeholders were identified:"),
      bullet("Patients (Students and Faculty) — The primary end-users of the portal. They anticipated that their requirements — self-service access to records, appointment booking, sick note management, and confidential mental wellness support — would be fully and intuitively implemented. They were involved throughout the requirements-gathering phase and participated in UAT."),
      bullet("Administrator (Dr. Nyoni, Chief Medical Officer) — The primary clinical stakeholder and system administrator. Dr. Nyoni expected the system to faithfully reflect the real-world clinical workflow, provide real-time control of the intake queue and pharmacy, and enforce strict data security. Dr. Nyoni was the primary authority for UAT sign-off."),
      bullet("Institutional Management (Masvingo Polytechnic) — The institution expected the system to enhance the reputation of its clinical services, protect student data, and deliver a scalable, cost-effective solution requiring no recurring licensing expenditure."),

      h2("2.6 Work Plan"),
      para("The work plan expresses the tasks associated with the project, who is responsible, and the timeline for completion."),
      makeTable(
        ["Task", "Responsible", "Initial Date", "Final Date", "Lapsed Time"],
        [
          ["Planning","Project developer","Week 1","Week 2","2 weeks"],
          ["Analysis","Project developer","Week 3","Week 4","2 weeks"],
          ["Design","Project developer","Week 5","Week 6","2 weeks"],
          ["Development","Project developer","Week 7","Week 14","8 weeks"],
          ["Testing","Project developer + stakeholders","Week 13","Week 14","2 weeks"],
          ["Deployment & Training","Project developer","Week 15","Week 15","1 week"],
          ["Documentation","Project developer","Week 1","Week 15","Ongoing"],
        ],
        [1800, 1800, 1400, 1400, 1426]
      ),
      tableCaption("Table 2.9: Work Plan."),

      h2("2.7 Gantt Chart"),
      para("The Gantt chart below represents the sequence of project activities over the 15-week development timeline."),
      ...emptyLine(1),
      placeholder("Fig 2.1 — GANTT CHART. Draw a standard horizontal bar Gantt chart with 15 weekly columns (Week 1 through Week 15) and 7 rows for: Planning, Analysis, Design, Development, Testing, Deployment & Training, and Documentation. Bars are filled in green (#1A7A4A). Planning spans Weeks 1-2. Analysis spans Weeks 3-4. Design spans Weeks 5-6. Development spans Weeks 7-14. Testing spans Weeks 13-14 (overlap with development). Deployment & Training is Week 15. Documentation spans the full 15 weeks. Use a white/light grid background, bold row labels on the left, and week numbers at the top."),
      tableCaption("Fig 2.1: Gantt Chart."),

      h2("2.8 Conclusion"),
      para("The planning phase communicated the evaluation of requirements of the candidate system and confirmed it is feasible enough to be worth pursuing across all dimensions analysed. The chapter also considered the business value expected from the system, how the development tasks were to be allocated and scheduled, the stakeholders involved, and the risks identified with their associated mitigation strategies. The next chapter communicates the analysis phase of the project."),
      pageBreak(),

      // ═══════════════════ CHAPTER 3 ═══════════════════════════════════════
      h1("Chapter 3: Analysis Phase"),
      h2("3.1 Introduction"),
      para("This chapter communicates a systematic decomposition of the existing clinical management system at Masvingo Polytechnic, describes its constituent processes, documents its shortcomings, and uses this analysis to formulate precise requirements for the proposed system. The system's requirements were gathered and formalised through multiple data-gathering methods and modelled in the form of data flow diagrams, UML diagrams, and a use case diagram. Alternative solutions were evaluated to justify the recommended approach."),

      h2("3.2 Information Gathering Methodologies"),
      para("Direct observation, stakeholder interviews, and user questionnaires were employed to extract data from source for analysis and requirements discovery."),

      h3("3.2.1 Direct Observation"),
      para("A participant observation method, where the researcher immersed themselves in the clinical environment and observed the daily workflow as it unfolded naturally, was utilised. The ABC observation method was employed:"),
      bullet("A (Attendant) — The observer identified each individual present at the clinic: patients queuing, the medical officer conducting consultations, and pharmacy staff managing dispensing. This enabled the mapping of individual roles and their contributions to the overall workflow."),
      bullet("B (Behaviour) — The observer analysed the behaviour of each individual and documented how their actions contributed to or created bottlenecks in the clinical process."),
      bullet("C (Consequences) — The observer documented the resultant consequences of each behaviour, for example, the absence of an automated stock system resulting in undetected pharmacy stockouts."),
      para("Observations were carried out over multiple sessions across the morning clinic hours at the Masvingo Polytechnic clinic. Sessions specifically targeted the clinical intake process, pharmacy dispensing, and the manual record retrieval workflow."),

      h4("3.2.1.1 Findings"),
      para("Patterns were identified where the physical intake queue regularly exceeded 10 patients at peak times, with average waiting times of 35 to 50 minutes. The pharmacy dispensary ledger showed inconsistent entries, with some transactions lacking an authorising signature. Record retrieval from physical filing cabinets was observed to cause delays of between 3 and 8 minutes per patient. No digital backup of any patient record was found to exist."),

      h3("3.2.2 Interviews"),
      para("Since observation alone can introduce bias when subjects are aware they are being observed, in-depth stakeholder interviews were conducted to obtain richer, qualitative insights."),
      para("Formal, in-person one-on-one interviews were conducted with Dr. Nyoni as the primary clinical stakeholder. Two interviews were conducted with Dr. Nyoni alone, to obtain undiluted expert opinions on the clinical workflow and system requirements. A further session was conducted jointly with clinical support staff to obtain combined perspectives."),
      para("Interview sessions were each approximately 25 minutes in duration. Core questions addressed included:"),
      bullet("A full walkthrough of the daily clinical intake process from patient arrival to record update."),
      bullet("The pharmacy dispensary process, the data structure required for clinical logs, and the consequences of stockouts."),
      bullet("The sick note approval workflow and mental wellness service requirements."),
      bullet("The proposed role-based access model and data segregation requirements."),

      h4("3.2.2.1 Findings"),
      para("Interviews with Dr. Nyoni revealed deep concern over the administrative burden imposed by the manual system. A clear pattern emerged where communication failures — for example, patients not knowing their queue position or appointment status — were a significant source of frustration. Dr. Nyoni specifically identified the pharmacy stock management and the manual dispensary ledger as the most error-prone and time-consuming aspects of daily operations, and expressed strong demand for a digital intake queue, live stock alerts, and a full dispensary audit trail."),

      h3("3.2.3 Questionnaires"),
      para("Since interviews were restricted to clinical staff, questionnaires were deployed to reach the broader patient population (students and faculty) efficiently and at scale. The researcher sought information that identified barriers to accessing clinical services, demand for self-service features, and privacy expectations around sensitive health data."),
      para("A set of structured questions was drafted and distributed digitally to a sample of 50 respondents, both students who had attended the clinic and those who had not. The questionnaire addressed topics including:"),
      bullet("Whether students were aware of the range of services provided by the clinic."),
      bullet("Their satisfaction with current waiting times and the absence of online booking."),
      bullet("Their comfort level with accessing mental wellness support through a confidential online portal."),
      bullet("Their expectations regarding the privacy of mental health records relative to academic records."),
      para("The questionnaire instrument used in this study is included in Appendix B."),

      h4("3.2.3.1 Findings"),
      para("Survey responses indicated that over 88% of students were frustrated with long physical queuing times and the inability to access their own medical records digitally. 91% confirmed they would use an online appointment booking system if available. 78% expressed concern about the privacy of mental health records held within the same physical filing system as general medical records. Medical staff unanimously identified manual pharmacy stock tracking as the most error-prone aspect of daily clinical operations."),

      h2("3.3 Analysis of the Existing System"),
      para("The versions of information extracted from the data gathered confirmed that the current system consists of an entirely manual flow of activities. The main users of the system and their goals were mapped as below:"),
      makeTable(
        ["Inputs", "Processes", "Outputs"],
        [
          ["Physical patient presence at the clinic.\nHandwritten consultation notes.\nManual pharmacy dispensary ledger entries.\nVerbal communication between patients and staff.",
           "Patient joins physical queue.\nMedical officer retrieves paper file.\nConsultation conducted; notes written by hand.\nPharmacy manually checks stock and dispenses.\nSick notes typed or written manually.\nRecords filed back into physical folders.",
           "Handwritten medical certificates (physical only).\nUpdated paper patient files.\nManually updated physical pharmacy stock registers.\nFragmented patient history with no digital backup."]
        ],
        [2800, 3000, 2826]
      ),
      tableCaption("Table 3.1: Current System Analysis."),

      h2("3.4 Data Analysis"),
      para("Different techniques were deployed to analyse and configure raw data into logical information that could be presented in a meaningful and structured form. Context diagrams, data flow diagrams, UML activity diagrams, and use case diagrams were all produced for the existing system."),

      h3("3.4.1 Context Diagram (Existing System)"),
      para("The existing system's context diagram, illustrating the key external entities and their interactions with the current manual clinical process, is shown below."),
      ...emptyLine(1),
      placeholder("Fig 3.1 — CONTEXT DIAGRAM (EXISTING SYSTEM). Draw a Level-0 context diagram (bubble diagram). Central bubble labelled '0: Manual Clinical System (Masvingo Polytechnic Clinic)'. External entities (rectangles) surrounding it: LEFT: 'Patient (Student/Faculty)' — sends 'Physical Presence, Verbal Request' into the system; receives 'Handwritten Sick Note, Physical Certificate' from the system. RIGHT: 'Medical Officer (Dr. Nyoni)' — sends 'Handwritten Consultation Notes, Manual Pharmacy Ledger Entries' into the system; receives 'Paper Patient File, Manual Stock Register' from the system. BOTTOM: 'Physical Filing System' — bidirectional arrow labelled 'Paper Records Storage and Retrieval'. Use navy (#1B2A4A) for entity boxes, green (#1A7A4A) for arrows, and circle for the central process. Include a small KEY box."),
      tableCaption("Fig 3.1: Context Diagram (Existing System)."),

      h3("3.4.2 Data Flow Diagram (Existing System)"),
      para("The existing system's data flow diagram, illustrating the detailed flow of processes and data within the current manual workflow, is shown below."),
      ...emptyLine(1),
      placeholder("Fig 3.2 — DATA FLOW DIAGRAM (EXISTING SYSTEM). Draw a Level-1 DFD with the following processes (rounded rectangles): P1 'Patient Arrival & Queue', P2 'Record Retrieval', P3 'Consultation', P4 'Pharmacy Dispensing', P5 'Sick Note Issuance', P6 'Record Filing'. Data stores (open rectangles): D1 'Physical Patient Files (Filing Cabinet)', D2 'Pharmacy Dispensary Ledger (Paper)'. External entities: 'Patient' and 'Medical Officer'. Flow: Patient → P1 (joins queue) → P2 (retrieves paper file from D1) → P3 (consult, write notes) → P4 (check D2, dispense, update D2) → P5 (if needed: write sick note, give to Patient) → P6 (file notes back to D1). Use DFD standard notation. Arrows labelled with data names. Navy/green colour scheme."),
      tableCaption("Fig 3.2: Data Flow Diagram (Existing System)."),

      h3("3.4.3 UML Activity Diagram (Existing System)"),
      para("The existing system's UML activity diagram, illustrating the end-to-end clinical intake workflow, is shown below."),
      ...emptyLine(1),
      placeholder("Fig 3.3 — UML ACTIVITY DIAGRAM (EXISTING SYSTEM). Draw a swimlane activity diagram with two lanes: 'PATIENT lane' (left) and 'MEDICAL OFFICER lane' (right). Flow: START → [Patient lane] Patient Arrives at Clinic → Patient Joins Physical Queue → [Medical Officer lane] Decision: 'Does patient have existing records?' → YES: Retrieve Paper File | NO: Create New Paper File → Merge → Medical Officer Conducts Consultation → Write Consultation Notes (manual) → Decision: 'Is medication required?' → YES: Check Physical Stock → Dispense Medication → Log in Paper Ledger → Decision: 'Is sick note required?' | NO: skip to record filing → YES: Write/Type Sick Note → Hand to Patient → File Records Back in Cabinet → END. Use standard UML notation: filled circle for start, circle-in-circle for end, diamonds for decisions, rectangles for activities. Navy/green scheme."),
      tableCaption("Fig 3.3: UML Activity Diagram (Existing System)."),

      h3("3.4.4 Use Case Diagram (Existing System)"),
      para("The existing system's use case diagram, illustrating the interactions between system actors and available system functions, is shown below."),
      ...emptyLine(1),
      placeholder("Fig 3.4 — USE CASE DIAGRAM (EXISTING SYSTEM). Draw a UML use case diagram inside a rectangle labelled 'Manual Clinical System — Masvingo Polytechnic'. Two actors (stick figures) outside the boundary: 'Patient (Student/Faculty)' on the left and 'Medical Officer (Dr. Nyoni)' on the right. Use cases (ovals inside boundary): 'Join Physical Queue', 'Attend Consultation', 'Receive Handwritten Sick Note', 'Receive Handwritten Certificate' (all accessible to Patient). 'Retrieve Paper File', 'Conduct Consultation', 'Write Consultation Notes', 'Check Physical Pharmacy Stock', 'Dispense Medication & Log in Ledger', 'Issue Handwritten Sick Note', 'File Paper Records' (all accessible to Medical Officer). Draw association lines between actors and their use cases. Navy/green colour scheme, standard UML notation."),
      tableCaption("Fig 3.4: Use Case Diagram (Existing System)."),

      h2("3.5 Weaknesses of the Current System"),
      bullet("Heavily manual and time-consuming: the physical intake queue and paper record retrieval result in waiting times of 35 to 50 minutes."),
      bullet("Risk of irreversible data loss: all critical health records exist as physical documents vulnerable to fire, flooding, or physical deterioration."),
      bullet("Poor pharmacy inventory management: manual stock tracking is prone to human error, leading to undetected stockouts of critical medications."),
      bullet("No patient self-service: patients must physically visit the clinic to access records, obtain sick notes, or book appointments."),
      bullet("No audit trail: the system cannot produce a reliable log of who dispensed what medication to which patient and when."),
      bullet("Mental health privacy risk: sensitive mental health records are stored alongside general medical records with no technical segregation."),

      h2("3.6 Evaluation of Alternatives"),
      para("Three alternatives for addressing the identified weaknesses were evaluated before the recommended solution was selected."),

      h3("3.6.1 Enhancement of the Manual System"),
      para("Description: Improving the existing paper-based system through better-organised filing, pre-printed forms, and standardised ledger templates."),
      bullet("Merits: Very low cost; no technology barrier for staff."),
      bullet("Causes why not selected: Does not solve any of the core problems. Lacks digital access, real-time inventory management, patient self-service, or any form of data security beyond physical locks. Not scalable."),

      h3("3.6.2 Off-the-Shelf Healthcare Management Software"),
      para("Description: Procuring a pre-existing, generic clinic management software package and adapting it for institutional use."),
      bullet("Merits: Faster to deploy; often includes vendor support."),
      bullet("Causes why not selected: High and recurring licensing fees. Lacks features specific to an educational institution context such as student ID-based authentication, sick note workflows, and a student mental wellness module. Institutional data may reside on third-party servers."),

      h3("3.6.3 Custom-Built System (Recommended Solution)"),
      para("Description: Designing and building the Masvingo Poly Clinical Portal from the ground up using a modern, purpose-built technology stack."),
      bullet("Perfectly tailored to the institutional context, with every feature directly derived from stakeholder requirements."),
      bullet("No recurring licensing fees; institutional data remains entirely within the institution's control."),
      bullet("Scalable; future modules can be added without vendor dependency."),
      bullet("The development team is available on-ground for maintenance and future development."),

      h2("3.7 Requirements Analysis"),
      para("The weaknesses of the existing system formed the template for the requirements of the candidate system. Specific user requirements were outlined to drive the design and development phases."),

      h3("3.7.1 Functional Requirements"),
      para("Administrator Role:"),
      bullet("The system shall display a real-time Clinical Intake Queue showing all waiting patients."),
      bullet("The system shall allow the administrator to start and manage an active consultation session."),
      bullet("The system shall allow the administrator to add, edit, and delete pharmacy inventory items."),
      bullet("The system shall automatically flag pharmacy items as 'REPLENISH NOW' when stock falls below a defined threshold."),
      bullet("The system shall maintain a full, date-filterable dispensary history log."),
      bullet("The system shall allow the administrator to approve or reject student sick note applications."),
      para("Patient Role:"),
      bullet("The system shall allow patients to view their complete clinical log feed and download individual consultation records."),
      bullet("The system shall allow patients to book, view, and manage appointments."),
      bullet("The system shall allow patients to apply for sick notes and track the status of their application."),
      bullet("The system shall provide a confidential Mental Wellness Hub, accessible only by the patient."),

      h3("3.7.2 Non-Functional Requirements"),
      bullet("Security: RBAC must be enforced at both the frontend and backend (Firestore Security Rules) levels. All communication must be encrypted via HTTPS."),
      bullet("Performance: All pages must load within 3 seconds. Real-time queue updates must appear in under 1 second."),
      bullet("Usability: The interface must be clean, intuitive, and fully mobile-responsive."),
      bullet("Reliability: The system shall target 99.9% availability using Firebase's cloud infrastructure."),
      bullet("Confidentiality: Mental health data must be stored in a segregated Firestore collection with security rules that explicitly deny access to any user other than the individual patient."),

      h3("3.7.2.1 Constraints"),
      bullet("The system must be accessible from any standard modern web browser without installation."),
      bullet("The system must function on mobile, tablet, and desktop devices (full responsiveness)."),
      bullet("The system must operate within the free tiers of Firebase and Vercel/Netlify for standard institutional usage volumes."),

      h2("3.8 Conclusion"),
      para("The existing system was thoroughly analysed using a range of graphical methods including a context diagram, a data flow diagram, a UML activity diagram, and a use case diagram. Diverse data-gathering methods were employed, and the extracted data was transformed and structured for analysis. The weaknesses of the current system were identified and directly informed the formulation of specific user requirements. Alternative approaches were evaluated to justify the recommendation of a custom-built solution. This enabled both the developer and the stakeholders to share a clear understanding of scope, requirements, and constraints before proceeding to design. The next chapter communicates the design phase of the project."),
      pageBreak(),

      // ═══════════════════ CHAPTER 4 ═══════════════════════════════════════
      h1("Chapter 4: Design Phase"),
      h2("4.1 Introduction"),
      para("Design is for understanding, according to Gries et al. (2020). This chapter communicates the architectural blueprint of the Masvingo Poly Clinical Portal — how the system's logical and physical components are structured, how they interact, and how the design translates the requirements from Chapter 3 into a form that developers can code and implement. The use of diverse structure-oriented and function-oriented design diagrams, coupled with detailed database and interface design specifications, ensures that every developer working on the system shares an identical mental model of what is being built."),

      h2("4.2 Architectural Design"),
      para("The Masvingo Poly Clinical Portal is based on a client-server architecture, specifically implemented as a modern Single-Page Application (SPA) with a Serverless Backend. In this architecture, the React frontend (running in the user's browser) acts as the client, communicating directly with Firebase (the server) via the Firebase SDK. Firebase acts as both the authentication server and the real-time database server."),
      para("Each entity in the system can effectively play a dual role: the Administrator (Dr. Nyoni) is a client when viewing the patient queue but acts in a server-like capacity when initiating consultation sessions that push real-time updates to patient views. The science and logic of these operations are illustrated below."),
      ...emptyLine(1),
      placeholder("Fig 4.1 — CLIENT-SERVER ARCHITECTURE DIAGRAM. Draw a three-tier client-server architecture diagram. Left tier (Clients): two boxes stacked — 'Administrator Browser (Dr. Nyoni)' and 'Patient Browser (Student/Faculty)'. Both connected by arrows to the Middle tier. Middle tier: 'React Frontend (SPA) — Vite Build, React Router, Tailwind CSS, TypeScript'. Connected by bidirectional arrows (labelled 'Firebase SDK Calls / Real-time onSnapshot') to the Right tier. Right tier (Server): 'Firebase Cloud (Google)' containing two sub-boxes — 'Firebase Authentication (Identity Management)' and 'Cloud Firestore (NoSQL Real-time Database)'. Below Firebase, add a note box: 'Hosting: Vercel / Netlify'. Use navy/green colour scheme, clear directional arrows, and rounded box corners."),
      tableCaption("Fig 4.1: Client-Server Architecture."),

      h2("4.3 System Design"),
      para("This describes how the system's components work together. The key modules of the system are:"),
      bullet("Students and Faculty (Patients) — The primary end-users. They access the portal to join the clinical queue, view their medical records, book appointments, apply for sick notes, and access the Mental Wellness Hub."),
      bullet("The Medical Officer (Dr. Nyoni, Administrator) — The system's primary operator. Dr. Nyoni manages the clinical intake queue, pharmacy inventory, dispensary history, sick note approvals, and the student registry."),
      bullet("Firebase Cloud — The platform that stores all data, manages authentication, enforces security rules, and provides real-time data synchronisation between all connected clients."),

      h3("4.3.1 Context Diagram and DFD of the Proposed System"),
      para("These diagrams provide a general explanation of how the system's components are structured and how they interact. They emphasise the structure and data flows of the proposed system."),

      h4("4.3.1.1 Context Diagram (Proposed System)"),
      para("The proposed system's context diagram, illustrating the key external entities and their data interactions with the Masvingo Poly Clinical Portal, is shown below."),
      ...emptyLine(1),
      placeholder("Fig 4.2 — CONTEXT DIAGRAM (PROPOSED SYSTEM). Draw a Level-0 context diagram (bubble diagram). Central bubble labelled '0: Masvingo Poly Clinical Portal System'. External entities (rectangles): LEFT: 'Patient (Student/Faculty)' — sends: 'Login Credentials, Appointment Requests, Sick Note Applications, Mood Check-ins'; receives: 'Clinical Records, Appointment Confirmation, Sick Note Status, Wellness Feedback'. RIGHT: 'Administrator (Dr. Nyoni / Medical Officer)' — sends: 'Patient Queue Actions, Pharmacy Updates, Consultation Records, Dispensary Data'; receives: 'Real-time Queue Status, Stock Alerts, Dispensary History, Patient Summaries'. BOTTOM: 'Firebase Cloud Database' — bidirectional arrow labelled 'Data Storage and Retrieval'. Also: 'Unregistered User' external entity on far left — receives: 'Login Page, Emergency Crisis Button'. Use navy/green colour scheme, DFD standard notation. Include KEY box."),
      tableCaption("Fig 4.2: Context Diagram (Proposed System)."),

      h4("4.3.1.2 Data Flow Diagram (Proposed System)"),
      para("The proposed system's data flow diagram, illustrating the flow of events and processes within the Clinical Portal, is shown below."),
      ...emptyLine(1),
      placeholder("Fig 4.3 — DATA FLOW DIAGRAM (PROPOSED SYSTEM — LEVEL 1). Draw a Level-1 DFD. External entities: 'Patient' (left), 'Administrator' (right). Processes (rounded rectangles): P1 'Authentication & Role Assignment', P2 'Clinical Queue Management', P3 'Pharmacy Inventory & Dispensary', P4 'Medical Records Management', P5 'Appointment & Sick Note Processing', P6 'Mental Wellness Hub'. Data stores (open rectangles): D1 'Firestore: /users', D2 'Firestore: /patients & /clinicalLogs', D3 'Firestore: /pharmacy & /dispensaryHistory', D4 'Firestore: /appointments & /sickNotes', D5 'Firestore: /mentalWellness (SECURED)'. Flows: Patient → P1 (credentials) → D1 (store/verify); Admin → P2 (queue actions) → D2 (read/write); Admin → P3 (inventory updates) → D3 (read/write); Patient → P4 (view/download) → D2 (read only); Patient → P5 (book/apply) → D4 (read/write); Admin → P5 (approve/reject) → D4; Patient → P6 (mood/journal) → D5 (read/write, patient only). Navy/green colour scheme, standard DFD notation."),
      tableCaption("Fig 4.3: Data Flow Diagram (Proposed System)."),

      h3("4.3.2 UML Activity and Use Case Diagrams (Proposed System)"),
      para("These diagrams describe system behaviour — what the system does — and are helpful for understanding how modules interact with each other and with the actors who use them."),

      h4("4.3.2.1 UML Activity Diagram (Proposed System)"),
      para("The proposed system's UML activity diagram for the Administrator's clinical intake management workflow is shown below."),
      ...emptyLine(1),
      placeholder("Fig 4.4 — UML ACTIVITY DIAGRAM (PROPOSED SYSTEM — ADMINISTRATOR MANAGES CLINICAL INTAKE). Draw a swimlane activity diagram with one lane: 'Administrator (Dr. Nyoni)'. Flow: START → Administrator logs in and opens Queue page → System displays live waiting list → Decision: 'Is there an active consultation?' → YES: Display current session details → Admin ends session first → return to decision point. NO: Admin selects next patient from waiting list → System creates active session in Firestore → Admin conducts consultation and records clinical log → Decision: 'Is a sick note required?' → YES: Admin issues sick note — system writes to Firestore → continue to end session. NO: Admin ends consultation session → System marks session COMPLETED and removes patient from queue → END. Use standard UML notation, navy/green colour scheme."),
      tableCaption("Fig 4.4: UML Activity Diagram (Proposed System)."),

      h4("4.3.2.2 Use Case Diagram (Proposed System)"),
      para("The proposed system's use case diagram, illustrating all actor-system interactions in the Masvingo Poly Clinical Portal, is shown below."),
      ...emptyLine(1),
      placeholder("Fig 4.5 — USE CASE DIAGRAM (PROPOSED SYSTEM). Draw a UML use case diagram inside a rectangle labelled 'Masvingo Poly Clinical Portal'. Three actors (stick figures) outside the boundary: 'Unregistered User' (far left), 'Patient (Student/Faculty)' (left), 'Administrator (Dr. Nyoni)' (right). Unregistered User uses: 'View Login Page', 'Use Emergency Crisis Button'. Patient uses (after <<includes>> Authenticate): 'View/Download Medical Records', 'Book Appointment', 'Apply for Sick Note', 'Track Sick Note Status', 'Access Mental Wellness Hub' (<<extends>>: 'Complete Mood Check-In', 'Write Journal Entry'). Administrator uses (after <<includes>> Authenticate): 'Manage Clinical Intake Queue', 'Start/End Consultation Session', 'Record Clinical Log', 'Issue Sick Note', 'Manage Pharmacy Inventory', 'View Dispensary History', 'Approve/Reject Sick Note Applications', 'Manage Student Registry'. Use standard UML notation with association lines, <<includes>> and <<extends>> dashed arrows. Navy/green colour scheme."),
      tableCaption("Fig 4.5: Use Case Diagram (Proposed System)."),

      h2("4.4 Physical Design"),
      para("Physical design is concerned with how software and hardware interact to deliver the system's functionality and guarantee a quality user experience. The physical design of the Masvingo Poly Clinical Portal is illustrated below."),
      ...emptyLine(1),
      placeholder("Fig 4.6 — SOFTWARE-HARDWARE INTERACTION DIAGRAM. Draw a physical deployment diagram showing: USER DEVICES (left side): three device icons stacked — Desktop/Laptop PC, Tablet, Smartphone. Each device contains 'Web Browser'. Arrows from all devices pointing right, labelled 'HTTPS (SSL/TLS encrypted)'. INTERNET CLOUD (middle): standard cloud shape labelled 'Internet'. Arrow pointing right from cloud, labelled 'Firebase SDK API Calls'. FIREBASE CLOUD (right side): a server/cloud box containing three sub-components: 'Firebase Authentication (user identity)', 'Cloud Firestore (real-time NoSQL database)', 'Firebase Storage (document/file uploads)'. Below the main diagram, a separate box labelled 'Vercel/Netlify CDN — serves the React SPA (static files)' with an arrow pointing left toward user devices labelled 'Static File Delivery (HTML/JS/CSS)'. Navy/green colour scheme, clear labels."),
      tableCaption("Fig 4.6: Software Interaction with Hardware."),

      h2("4.5 Database Design"),
      para("Elmasri and Navathe (2015) reveal database design as the process of creating structural diagrams that describe static and structural relationships among data objects. The Masvingo Poly Clinical Portal uses Firebase Cloud Firestore, a NoSQL document-based database with real-time synchronisation. The data modelling process identified the core data entities and their relationships, producing the EER diagram below."),

      h3("4.5.1 Extended Entity Relationship (EER) Diagram"),
      para("The EER diagram below encompasses the additional modelling concepts required for the system's data model, including entity inheritance and relationships between the key collections."),
      ...emptyLine(1),
      placeholder("Fig 4.7 — EXTENDED ENTITY RELATIONSHIP (EER) DIAGRAM. Draw a formal EER diagram with the following entities (rectangles with attributes as ovals): USER (userId PK, email, displayName, role, registrationNumber) → PATIENT extends USER (institutionalAccessLevel, consultationsCount, certificatesCount). Relationships: PATIENT has many CLINICAL_LOG (logId PK, condition, createdAt, documentURL, authorisedBy, patientId FK) — one-to-many. PATIENT has many APPOINTMENT (appointmentId PK, type, date, time, status, patientId FK) — one-to-many. PATIENT has many SICK_NOTE (noteId PK, reason, status, appliedAt, patientId FK) — one-to-many. PATIENT has one MENTAL_WELLNESS (patientId PK/FK, moodLog array, journalEntries array) — one-to-one. PATIENT has many DISPENSARY_HISTORY (recordId PK, patientId FK, medicineId FK, medicineName, quantity, timestamp, authorisedBy) — one-to-many. PHARMACY_ITEM (itemId PK, name, category, units, replenishThreshold) has many DISPENSARY_HISTORY — one-to-many. PATIENT has many COUNSELLING_SESSION (sessionId PK, patientId FK, scheduledDate, time, location, status) — one-to-many. Use standard EER notation, navy/green colour scheme, double-border for MENTAL_WELLNESS to indicate its special security classification. Include inheritance arrow from USER to PATIENT."),
      tableCaption("Fig 4.7: Extended Entity Relationship (EER) Diagram."),

      h3("4.5.2 Database Collections (Firestore Schema)"),
      para("The following tables describe the key Firestore collections and their document field structures."),
      makeTable(
        ["Field", "Type", "Constraint"],
        [
          ["userId","String (Firebase UID)","PRIMARY KEY (auto-generated)"],
          ["email","String","NOT NULL, UNIQUE"],
          ["displayName","String","NOT NULL"],
          ["role","String ('admin' | 'student' | 'faculty')","NOT NULL"],
          ["registrationNumber","String","NOT NULL for students"],
        ],
        [2800, 3000, 3026]
      ),
      tableCaption("Table 4.1: /users Collection."),
      makeTable(
        ["Field", "Type", "Constraint"],
        [
          ["userId","String (FK → /users)","PRIMARY KEY"],
          ["institutionalAccessLevel","Number (1-3)","NOT NULL"],
          ["consultationsCount","Number","DEFAULT 0"],
          ["certificatesCount","Number","DEFAULT 0"],
        ],
        [2800, 3000, 3026]
      ),
      tableCaption("Table 4.2: /patients Collection."),
      makeTable(
        ["Field", "Type", "Constraint"],
        [
          ["appointmentId","String (auto-ID)","PRIMARY KEY"],
          ["patientId","String (FK → /users)","NOT NULL"],
          ["type","String","NOT NULL"],
          ["date","String (YYYY-MM-DD)","NOT NULL"],
          ["time","String (HH:MM)","NOT NULL"],
          ["status","String ('CONFIRMED' | 'CANCELLED')","NOT NULL"],
        ],
        [2800, 3000, 3026]
      ),
      tableCaption("Table 4.3: /appointments Collection."),
      makeTable(
        ["Field", "Type", "Constraint"],
        [
          ["noteId","String (auto-ID)","PRIMARY KEY"],
          ["patientId","String (FK → /users)","NOT NULL"],
          ["reason","String","NOT NULL"],
          ["status","String ('PENDING' | 'APPROVED' | 'REJECTED')","NOT NULL"],
          ["appliedAt","Timestamp","NOT NULL"],
        ],
        [2800, 3000, 3026]
      ),
      tableCaption("Table 4.4: /sickNotes Collection."),
      makeTable(
        ["Field", "Type", "Constraint"],
        [
          ["itemId","String (auto-ID)","PRIMARY KEY"],
          ["name","String","NOT NULL"],
          ["category","String ('GENERAL' | other)","NOT NULL"],
          ["units","Number","NOT NULL, >= 0"],
          ["replenishThreshold","Number","NOT NULL"],
        ],
        [2800, 3000, 3026]
      ),
      tableCaption("Table 4.5: /pharmacy Collection."),
      makeTable(
        ["Field", "Type", "Constraint"],
        [
          ["patientId","String (FK → /users)","PRIMARY KEY (patient-read-only)"],
          ["moodLog","Array of {mood, timestamp}","SECURED: patient-only access"],
          ["journalEntries","Array of {text, timestamp}","SECURED: patient-only access"],
        ],
        [2800, 3000, 3026]
      ),
      tableCaption("Table 4.6: /mentalWellness Collection (SECURED — patient read/write only)."),

      h2("4.6 Interface Design"),
      para("Interface design establishes the user experience (UX) environment. Diligent design was vital for engineering a visually appealing and user-friendly interface while maintaining the highest standards of data security. The interface was designed to achieve:"),
      bullet("Increased user satisfaction through clean, intuitive, role-appropriate layouts."),
      bullet("Improved productivity through minimal clicks required to complete common tasks."),
      bullet("Reduced errors and frustration through clear validation feedback and guided input forms."),

      h3("4.6.1 Menu Design"),
      para("The navigation menu provides options through which users can navigate the system. It was designed to be uncluttered and expressive of the system's core functions."),

      h4("4.6.1.1 Main Menu"),
      para("The main navigation menus for both the Administrator and Patient roles, which are rendered conditionally based on the authenticated user's role, are shown below."),
      ...emptyLine(1),
      placeholder("Fig 4.8 — MAIN MENU SCREENS (two side-by-side screenshots). LEFT: ADMINISTRATOR MAIN MENU — shows the dark-navy sidebar of the Admin Dashboard with the MasPoly Health logo at top, and menu items listed vertically: Queue (active/highlighted), Students, Pharmacy, History, Manage Users, Logout Session at bottom. The main content area shows 'CLINICAL INTAKE — MANAGING THE DAILY PATIENT FLOW' heading with a waiting list showing a patient card. RIGHT: PATIENT MAIN MENU — shows the light-themed patient sidebar with M-Poly logo, menu items: Home (active), Book, Alerts (with red badge), Mental, Logout Session. The main content area shows the patient's home dashboard with their name banner. These are screenshots from the actual app described in the documentation. Paste the actual Admin Dashboard and Student Dashboard screenshots here."),
      tableCaption("Fig 4.8: Main Menu Pages."),

      h4("4.6.1.2 Sub-Menus"),
      para("Additional navigation views that further elaborate the functional areas accessible from the main menu are shown below."),
      ...emptyLine(1),
      placeholder("Fig 4.9 — SUB-MENU SCREENS. Show 2-3 sub-menu/page screenshots from the application: (1) The Pharmacy Control page showing the full medication inventory table with OPTIMAL/REPLENISH NOW badges. (2) The Medical Hub / Book page showing the patient's appointment list and Sick Note History panel. (3) The Mental Wellness Hub page showing the CONFIDENTIAL SUPPORT banner, Daily Mood Check-In emoji selector (GREAT, GOOD, OKAY, LOW, CRISIS), Digital Mood Journal text area, and the Support Resources list. Paste actual app screenshots here as described in the documentation."),
      tableCaption("Fig 4.9: Sub-Menus."),

      h3("4.6.2 Input Designs"),
      para("Input forms provide the environments where users enter and submit information. Each input design was created to be straightforward, with clear field labels, validation feedback, and a minimal cognitive burden on the user."),
      ...emptyLine(1),
      placeholder("Fig 4.10 — LOGIN AND REGISTRATION INPUT FORMS. Show two side-by-side input form screenshots: LEFT: LOGIN FORM — full-screen page with Masvingo Polytechnic institutional background/logo, a role selector showing 'STUDENT' and 'FACULTY' toggle buttons, text fields for 'Identification' and 'Verification Password', a login submit button, and an 'EMERGENCY CRISIS SYSTEM' button at the bottom. RIGHT: STUDENT QUEUE ENTRY / JOIN QUEUE form — showing the queue join form or the student registration form with fields for Registration Number, Full Name, Faculty/Department, and reason for visit. Paste actual app screenshots."),
      tableCaption("Fig 4.10: Login and Registration Input Forms."),
      ...emptyLine(1),
      placeholder("Fig 4.11 — APPOINTMENT BOOKING AND SICK NOTE APPLICATION INPUT FORMS. Show two side-by-side input form screenshots: LEFT: APPOINTMENT BOOKING FORM — showing fields for Appointment Type (dropdown), Preferred Date (date picker), Preferred Time, and a 'Confirm Appointment' button. RIGHT: SICK NOTE APPLICATION FORM — showing a text area for 'Reason for Sick Note Application', date range fields for start and end dates, and an 'Apply for Sick Note' submit button. Paste actual app screenshots."),
      tableCaption("Fig 4.11: Appointment Booking and Sick Note Application Forms."),

      h3("4.6.3 Output Design and Reports"),
      para("Output views display the results of system processes to the relevant users. Each output design was engineered to present the right information, to the right user, in a clear and actionable format."),
      ...emptyLine(1),
      placeholder("Fig 4.12 — ADMIN DASHBOARD AND PHARMACY OUTPUT VIEWS. Show two screenshots stacked or side by side: TOP/LEFT: ADMIN DASHBOARD (Clinical Intake) — shows the full admin dashboard with the 'CLINICAL INTAKE' header, the 'Active Consultation Session' panel (either showing 'NO ACTIVE CONSULTATION SESSION' or a patient card with name, condition, and vital signs), and the 'CURRENT WAITING LIST' below it with one or more patient queue cards showing queue number, name, faculty, time, and action buttons (TRANSFER, DOCTOR NOT AVAILABLE, etc.). BOTTOM/RIGHT: PHARMACY CONTROL PAGE — shows the full pharmacy inventory table with columns: Medicine Component, Category, Units, Registry (with green OPTIMAL and red REPLENISH NOW status badges), and Actions (EDIT, DELETE). Paste actual app screenshots."),
      tableCaption("Fig 4.12: Admin Dashboard and Pharmacy Control Output Views."),
      ...emptyLine(1),
      placeholder("Fig 4.13 — PATIENT DASHBOARD OUTPUT VIEW. Show the full patient home dashboard screenshot: A banner at the top showing the patient's name in large text (e.g., 'ADMIRE MUFAMBI'), their registration number, and 'INSTITUTIONAL ACCESS LEVEL 1'. Below: a 'QUEUE DASHBOARD' card showing their position in the queue, estimated wait time, and 'Joined This Queue' timestamp. Below that: two side-by-side panels — LEFT: 'Medical Documents Vault' (showing any uploaded referral letters or medical excuse documents with download icons) and 'Clinical Summary' (showing Consultations count and Certificates count). RIGHT: 'Booking Tracker' (table with Status, Date, Countdown, Doctor, Condition columns) and 'CLINICAL LOG FEED' (a chronological list of past diagnoses with 'Download Record' buttons). Paste actual app screenshot."),
      tableCaption("Fig 4.13: Patient Dashboard Output View."),

      h2("4.7 Pseudo Code"),
      para("The following pseudo-code blocks present the English-like logical statements that were translated into the system's source code during the development phase."),

      h3("4.7.1 Login Pseudocode"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: "Prompt user to select role (STUDENT or FACULTY or ADMIN)\nPrompt user for their Identification and Password\nRetrieve the user's hashed credentials from Firebase Authentication\nIF the credentials match the stored record THEN\n    Retrieve user role from /users/{userId} in Firestore\n    IF role = 'admin' THEN navigate to Administrator Dashboard\n    ELSE navigate to Patient Dashboard\nELSE\n    Display error snackbar: 'Invalid credentials, please try again'", size: 20, font: "Courier New" })]
      }),

      h3("4.7.2 Clinical Intake Queue Pseudocode"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: "Patient submits queue join request\nWrite new document to /queue/{queueId} with patientId, timestamp, status = 'WAITING'\nAdmin opens Queue page — system attaches onSnapshot listener to /queue collection\nWhen Admin clicks 'Admit Patient':\n    Create new document in /activeSessions with patientId and sessionStart timestamp\n    Update /queue/{queueId} status to 'IN_CONSULTATION'\nWhen Admin clicks 'End Session':\n    Write consultation record to /patients/{userId}/clinicalLogs\n    IF sick note required THEN write to /sickNotes\n    Update /activeSessions status to 'COMPLETED'\n    Remove patient from /queue — all subscribed clients update in real time", size: 20, font: "Courier New" })]
      }),

      h3("4.7.3 Pharmacy Dispensing Pseudocode"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: "Admin selects patient, medication, and quantity on Dispensary form\nValidate: quantity > 0 AND quantity <= current /pharmacy/{itemId}.units\nIF valid THEN\n    Write new document to /dispensaryHistory with patientId, medicineId, quantity, timestamp, authorisedBy\n    Decrement /pharmacy/{itemId}.units by quantity\n    IF updated units <= replenishThreshold THEN\n        Update /pharmacy/{itemId}.status = 'REPLENISH NOW'\n    ELSE\n        Update /pharmacy/{itemId}.status = 'OPTIMAL'\n    Firestore pushes real-time update to all subscribed clients\nELSE\n    Display error: 'Insufficient stock or invalid quantity'", size: 20, font: "Courier New" })]
      }),

      h3("4.7.4 Sick Note Application Pseudocode"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: "Patient submits sick note application form with reason and requested date range\nWrite new document to /sickNotes/{noteId} with patientId, reason, dates, status = 'PENDING', appliedAt timestamp\nAdmin's sick note management view updates in real time via onSnapshot listener\nIF Admin clicks 'Approve' THEN\n    Update /sickNotes/{noteId}.status = 'APPROVED'\n    Patient's Booking Tracker updates in real time: note shows 'APPROVED'\nELSE IF Admin clicks 'Reject' THEN\n    Update /sickNotes/{noteId}.status = 'REJECTED'\n    Patient's view updates accordingly", size: 20, font: "Courier New" })]
      }),

      h3("4.7.5 Mental Wellness Mood Check-In Pseudocode"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: "Patient navigates to Mental Wellness Hub\nFirestore Security Rules: ONLY allow read/write if request.auth.uid == patientId\nPatient selects mood from: GREAT | GOOD | OKAY | LOW | CRISIS\nAppend {mood: selectedMood, timestamp: now()} to /mentalWellness/{patientId}.moodLog array\nIF mood = 'CRISIS' THEN\n    Display crisis support resources and emergency contact options\nIF patient submits journal entry THEN\n    Append {text: journalText, timestamp: now()} to /mentalWellness/{patientId}.journalEntries\n    Note: no administrator or other user can ever read this data — Firestore rules enforce total segregation", size: 20, font: "Courier New" })]
      }),

      h2("4.8 Security Design"),
      para("Security design ensures the safety of the system's infrastructure and all related software components. It covers the process of identifying potential threats, evaluating associated risks, and implementing measures to mitigate those risks."),

      h3("4.8.1 Authentication Security"),
      para("All user access is gated behind Firebase Authentication. Passwords are hashed and salted by the Firebase platform before storage — no plaintext credentials are ever stored. Firebase Authentication also provides protections against brute-force login attempts through rate limiting."),

      h3("4.8.2 Role-Based Access Control (RBAC)"),
      para("The frontend dynamically renders navigation and content based on the authenticated user's role (admin, student, or faculty). Critically, this is enforced at the backend level as well through comprehensive Firestore Security Rules. Backend rules ensure that even if a user manipulates the frontend code, they cannot access data they are not authorised to see. The /mentalWellness/ collection is explicitly restricted so that it can only be read or written by the patient whose userId matches the document's patientId — no administrator or any other user can access this data via the API."),

      h3("4.8.3 Network Security"),
      para("All communication between clients and Firebase is automatically encrypted via SSL/TLS (HTTPS). The system does not operate over unencrypted HTTP. Firebase provides a secure, compliant infrastructure foundation certified to global security standards."),

      h3("4.8.4 Emergency Crisis Bypass"),
      para("The 'EMERGENCY CRISIS SYSTEM' button on the login page provides rapid access to crisis resources during a medical emergency, without requiring full authentication. Access through this bypass is logged by the system as an audit event."),

      h2("4.9 Conclusion"),
      para("This chapter drew the complete architectural, logical, and physical framework within which the Masvingo Poly Clinical Portal was to be built. The use of diverse design diagrams — context diagrams, DFDs, activity diagrams, use case diagrams, an EER diagram, and interface mockups — ensured that both the developer and stakeholders shared an unambiguous understanding of the system's structure, behaviour, and data model. The database design, security architecture, and pseudo-code blocks provided the precise specifications needed to proceed to the implementation phase. The next chapter communicates the implementation of the system."),
      pageBreak(),

      // ═══════════════════ CHAPTER 5 ═══════════════════════════════════════
      h1("Chapter 5: Implementation Phase"),
      h2("5.1 Introduction"),
      para("On completion of the design phase, a comprehensive understanding of the system's architecture, data model, and intended behaviour was on the table for the developer to execute coding, testing, debugging, installation, and maintenance of the system. This chapter documents the development environment and tools used, the coding approach, the testing strategy and sample test cases, the implementation plan and changeover strategy, data migration, user training, and maintenance recommendations."),

      h2("5.2 Coding"),
      para("Coding is the comprehensive process of transforming pseudo-code logic and design specifications into a working application using a formal programming language. The developer coded, debugged, and refined the system across both the frontend and backend layers. An example of this translation process is illustrated below — the login pseudo-code from Chapter 4 translates into the following source code, which produces the login screen shown."),

      h3("5.2.1 IF-THEN-ELSE Statements for Login"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: "Prompt user for their Identification (registration number) and Password\nRetrieve the user's hashed credentials from Firebase Authentication using email\nHash the password entered by the user\nCompare the hashed password entered by the user and that retrieved from Firebase\nIF the credentials match THEN\n    Retrieve user role from Firestore /users/{userId}\n    IF role = 'admin' THEN navigate to Administrator Dashboard\n    ELSE navigate to Patient Home Dashboard\nELSE\n    Display snackbar error to prompt the user to try again", size: 20, font: "Courier New" })]
      }),

      h3("5.2.2 Corresponding Source Code for Login"),
      ...emptyLine(1),
      placeholder("Fig 5.1 — LOGIN SOURCE CODE SCREENSHOT. Paste a screenshot of the actual TypeScript/React login component source code from VS Code, showing the handleLogin() or signIn() function. The code should show: the Firebase signInWithEmailAndPassword() call, the .then() handler that retrieves the user's role from Firestore /users/{uid}, the conditional navigation (navigate to admin dashboard if role === 'admin', else navigate to patient dashboard), and the .catch() handler that shows a snackbar error message. Use the VS Code dark theme screenshot."),
      tableCaption("Fig 5.1: Login Source Code (TypeScript/React)."),

      h3("5.2.3 Resultant Login Screen"),
      ...emptyLine(1),
      placeholder("Fig 5.2 — LOGIN SCREEN SCREENSHOT. Paste a screenshot of the actual rendered login page of the Masvingo Poly Clinical Portal. It should show: the institutional background, the MasPoly Health / M-Poly logo, the role selector toggle (STUDENT | FACULTY), text input fields for Identification and Verification Password, the main login/submit button, and the 'EMERGENCY CRISIS SYSTEM' button at the bottom of the page. Use the actual app screenshot."),
      tableCaption("Fig 5.2: Resultant Login Screen."),

      h2("5.3 Testing"),
      para("With the intention of detecting any errors arising after coding, the system was tested through multiple layers of testing strategy. The developer employed unit testing, integration testing, system testing, and acceptance testing, incorporating both white-box (structural) and black-box (behavioural) approaches."),
      bullet("White-Box Testing — Employed for verification of the system's internal logic, particularly the Firestore Security Rules and the real-time data update mechanisms. The developer examined the code's internal structure to verify that data flows matched the intended design."),
      bullet("Black-Box Testing — Employed for validation, testing the system exclusively through its external interface. Input was supplied and output was verified against expected results, without regard for internal implementation."),
      ...emptyLine(1),
      placeholder("Fig 5.3 — TESTING STRATEGIES DIAGRAM. Draw a hierarchical diagram showing the testing strategy pyramid or layers used in this project. Top level: 'Acceptance Testing (UAT) — Dr. Nyoni & Student Beta Testers'. Second level: 'System Testing — End-to-end workflow validation'. Third level: 'Integration Testing — Module compatibility verification'. Bottom level: 'Unit Testing — Individual component and form validation'. Draw as stacked layers or boxes with arrows pointing upward, in green/navy colour scheme. Label each layer with who performs it (Developer, Testers, End-users) and what method is used (White-Box or Black-Box)."),
      tableCaption("Fig 5.3: Testing Strategies."),

      h3("5.3.1 Unit Testing"),
      para("Unit testing is performed to stress-test every individual constituent module for validation and verification. The following test cases document the unit testing of key system components."),
      ...emptyLine(1),
      placeholder("Fig 5.4 — LOGIN EMPTY INPUT FIELDS TEST CASE SCREENSHOT. Paste a screenshot of the login form showing the validation error state when the user attempts to submit with empty Identification and/or Password fields. The screenshot should show red validation error messages beneath the empty input fields (e.g., 'Identification is required', 'Password is required') and the form preventing submission. Actual app screenshot."),
      tableCaption("Fig 5.4: Login Empty Input Fields Test Case."),
      ...emptyLine(1),
      placeholder("Fig 5.5 — APPOINTMENT BOOKING EMPTY INPUT FIELDS TEST CASE SCREENSHOT. Paste a screenshot of the appointment booking form showing validation error states when the user attempts to submit without selecting a date, time, or appointment type. Shows red validation messages under empty fields. Actual app screenshot."),
      tableCaption("Fig 5.5: Appointment Booking Empty Fields Test Case."),
      ...emptyLine(1),
      placeholder("Fig 5.6 — INVALID LOGIN CREDENTIALS TEST CASE SCREENSHOT. Paste a screenshot showing the login screen after a user has entered an incorrect identification or password and submitted the form. Should show a red snackbar notification at the bottom of the screen with an error message such as 'Invalid credentials. Please try again.' Actual app screenshot."),
      tableCaption("Fig 5.6: Invalid Login Credentials Test Case."),
      ...emptyLine(1),
      placeholder("Fig 5.7 — PHARMACY DISPENSING TEST CASE SCREENSHOT. Paste a screenshot showing the pharmacy dispensing workflow: either the dispensary form being filled in (selecting patient, medication, and quantity) or the resulting pharmacy inventory table immediately after a successful dispense, showing the updated unit count and correct OPTIMAL/REPLENISH NOW badge. Actual app screenshot."),
      tableCaption("Fig 5.7: Pharmacy Dispensing Workflow Test Case."),
      ...emptyLine(1),
      placeholder("Fig 5.8 — SICK NOTE APPROVAL WORKFLOW TEST CASE SCREENSHOT. Paste a screenshot of the Administrator's sick note management view showing a list of pending sick note applications (with student name, reason, and date range), and the APPROVE NOTE / REJECT buttons next to each application. Actual app screenshot."),
      tableCaption("Fig 5.8: Sick Note Approval Workflow Test Case."),
      ...emptyLine(1),
      placeholder("Fig 5.9 — SUCCESSFUL CONSULTATION SESSION TEST CASE SCREENSHOT. Paste a screenshot of the Doctor's active consultation page, showing a patient's name and details in the 'ACTIVE CONSULTATION' banner at the top, the Body Area selector panel (HEAD AND NECK, CHEST, ABDOMEN, etc.), the Vitals panel (Temperature slider, Heart Rate, BP fields, Pain Level), the Specific Part selector, the Symptoms field, and the Diagnosis field with suggested diagnosis tags. Actual app screenshot."),
      tableCaption("Fig 5.9: Active Consultation Session Test Case."),

      h3("5.3.2 Integration Testing"),
      para("Integration testing was performed by the developer and selected testers to verify that the individual modules — authentication, clinical queue, pharmacy, sick notes, appointments, and mental wellness — were compatible with each other and with Firebase when assembled into a complete system. A properly functioning integrated system, where a dispensary action simultaneously updates the pharmacy inventory, the dispensary history, and the patient's clinical record in real time, was the required outcome."),

      h3("5.3.3 System Testing"),
      para("System testing was conducted as a pure black-box test of the entire integrated system. It was the final technical test on the system itself, intended to detect any remaining bugs that unit and integration tests may not have caught. Complete end-to-end workflows were executed — from patient login and queue join, through consultation, pharmacy dispensing, and sick note issuance, to patient record download — to verify that the system functioned as designed under realistic operating conditions."),

      h3("5.3.4 Acceptance Testing"),
      para("User Acceptance Testing (UAT) was conducted with Dr. Nyoni as the primary testing authority for all administrative functions, and a group of student beta testers for the patient-facing portal. Quality was assured by identifying end-user views on the usability, intuitiveness, and completeness of the system. The system was approved for full deployment after UAT was successfully completed and both Dr. Nyoni and the student beta group formally confirmed the system was fit for its intended purpose."),

      h2("5.4 Installation"),
      para("On completion of system testing, the system was deployed to its production environment. There is no traditional installation process required on end-user devices — the entire application frontend is deployed to Vercel or Netlify via an automated Git-integrated deployment pipeline. Users access the system by navigating to the institutional URL in any modern web browser. The Firebase backend is live as a cloud service and requires no manual installation."),

      h3("5.4.1 System Changeover Strategies"),
      para("Changeover strategies are tools employed in transitioning from the old system to the new. The options evaluated were:"),
      bullet("Pilot Conversion — Deploying the system initially in a limited segment before full rollout. Rejected because it would require maintaining both manual and digital processes simultaneously and would produce biased data from a small, non-representative user group."),
      bullet("Parallel Running — Operating the new system alongside the old system for a transition period. Rejected because it doubles administrative workload and delays the full realisation of the system's benefits."),
      bullet("Direct Changeover (Recommended and Applied) — Switching directly from the manual system to the new system upon go-live. This was deemed appropriate because the transition is from a paper system to a digital one, meaning there is very little operational risk of losing functionality. The user base is composed of digitally literate students and faculty who were enthusiastic about the new system, and the direct changeover eliminated unnecessary duplication of effort."),

      h4("5.4.1.1 Justification"),
      para("The direct changeover method was employed because the existing system is entirely paper-based and the new system is entirely digital — there is no meaningful overlap between them, making a clean cutover both logical and low-risk. Dr. Nyoni completed full hands-on training before go-live, and student onboarding was managed through a phased registration drive rather than a phased system rollout."),

      h3("5.4.2 Data Migration"),
      para("Data migration is defined by VanderPlas (2016) as the procedure of transferring data from one data store to another. Since all existing patient records are physical paper documents, data migration involved manually capturing key historical records — primarily for existing registered patients — into the Firestore database. This was performed by the developer and Dr. Nyoni before the full system launch. The migration procedure employed the ETL approach:"),
      bullet("Extraction of data — Physical records were gathered and reviewed."),
      bullet("Transformation of data — Paper records were formatted according to the Firestore /patients/clinicalLogs schema."),
      bullet("Loading data — Formatted records were entered into the live Firestore database via the system's administrative interface."),
      para("The process was carefully planned and executed to ensure no data loss and to prevent the migration from exceeding the available time budget."),

      h3("5.4.3 User Training"),
      para("User awareness and training were essential to ensure successful adoption of the new system. Training was structured in two tracks:"),
      bullet("Administrator Training (Dr. Nyoni) — A dedicated, one-on-one, hands-on training session using the live production system. Focus areas included the clinical intake workflow, pharmacy control panel, sick note management, and student registry. A printed Quick Reference Guide (Appendix C, Section C.1) was provided for ongoing reference."),
      bullet("Student and Faculty Sensitisation — An announcement was distributed through the institution's official communication channels (email, notice boards, and student portal), explaining the new system, its benefits, and providing the URL and a QR code for easy access. A Patient User Guide (Appendix C, Section C.2) was made available within the portal itself."),

      h2("5.5 Maintenance"),
      para("Maintenance is the procedure of retaining the system in a continually operational state after installation. Continual modification is required due to possible faults, new security threats, evolving requirements, and new technologies. Four maintenance strategies are recommended:"),

      h3("5.5.1 Adaptive Maintenance"),
      para("As patients and staff identify new requirements — additional appointment types, new report formats, integration with institutional academic systems — the system will need to be adapted. The serverless Firebase architecture and React component model make adaptive maintenance straightforward, as new modules can be added without restructuring the existing codebase."),
      h4("5.5.1.1 Recommendation"),
      para("Adaptive maintenance is strongly recommended and should be driven by regular feedback sessions with Dr. Nyoni and the student body, aligned with the institution's annual planning cycle."),

      h3("5.5.2 Perfective Maintenance"),
      para("As users become familiar with the system, they will identify opportunities to enhance performance, refine the user interface, and add convenience features. These improvements constitute perfective maintenance and will serve to keep the portal competitive with modern healthcare technology standards."),
      h4("5.5.2.1 Recommendation"),
      para("Perfective maintenance should be scheduled on a bi-annual basis, incorporating user feedback collected through the portal's built-in feedback channels."),

      h3("5.5.3 Corrective Maintenance"),
      para("Also known as debugging, corrective maintenance addresses errors discovered after deployment. These may be code errors that escaped all testing phases, unexpected interactions between system modules, or Firebase SDK update incompatibilities."),
      h4("5.5.3.1 Recommendation"),
      para("A bug-reporting mechanism accessible to all users should be established. The developer should commit to addressing critical bugs within 48 hours and non-critical issues within two weeks of first report."),

      h3("5.5.4 Preventive Maintenance"),
      para("Preventive maintenance is a proactive approach to preventing system failure before it occurs. For this system, preventive maintenance includes regular review of Firebase security rules, monitoring of Firestore usage against free tier limits, and periodic review of dependency versions to address known security vulnerabilities."),
      h4("5.5.4.1 Recommendation"),
      para("A monthly system health check should be scheduled, reviewing usage statistics, security rule effectiveness, and any Firebase platform alerts, to ensure the system continues to operate at peak performance."),

      h2("5.6 Recommendations for Future Development"),
      para("Several features that were identified during requirements gathering could not be included within the 15-week development scope, and are recommended for future implementation:"),
      bullet("Telemedicine / Video Consultation — Integration of a video calling facility within the portal to enable remote consultations for students who are unable to attend the clinic in person."),
      bullet("Integration with Academic Systems — Linking the sick note approval workflow directly to the institution's academic registry system, so that approved sick notes automatically notify the relevant lecturers."),
      bullet("Native Mobile Application — While the current web application is fully mobile-responsive, a native iOS and Android application would enhance the offline experience and enable push notifications for appointment reminders."),
      bullet("Advanced Analytics Dashboard — A reporting module for Dr. Nyoni to view trends in patient visits, most common diagnoses, pharmacy usage rates, and mental wellness check-in patterns over time."),
      para("End-users are encouraged to record every fault, improvement, or add-on they consider necessary and to communicate these through the system's feedback channel, so they can be considered in future development sprints."),

      h2("5.7 Conclusion"),
      para("Development of the Masvingo Poly Clinical Portal proved to be a successful endeavour, with all primary requirements delivered within the planned 15-week schedule. The system comprehensively addresses every identified shortcoming of the existing manual clinical management process. Some additional user requirements could not be met within the current scope, as shown in the recommendations for future development, but these represent opportunities for iterative enhancement rather than deficiencies in the current system. The clinical portal is now live, and its ongoing use will continue to improve the healthcare experience for the entire Masvingo Polytechnic community."),
      pageBreak(),

      // ═══════════════════ REFERENCES ══════════════════════════════════════
      h1("References"),
      para("[1] S. Cleary, The Communication Handbook, 5th ed. New York, NY: Routledge, 2019."),
      para("[2] R. Elmasri and S. B. Navathe, Fundamentals of Database Systems, 7th ed. Hoboken, NJ: Pearson, 2015."),
      para("[3] J. VanderPlas, Python Data Science Handbook: Essential Tools for Working with Data. Sebastopol, CA: O'Reilly Media, 2016."),
      para("[4] D. Gries, F. B. Schneider, and J. Byers, A Logical Approach to Discrete Math. New York: Springer, 2020."),
      para("[5] P. Wiley, Systems Analysis and Design, 3rd ed. Indianapolis, IN: Wiley & Sons, 2020."),
      para("[6] A. Blinder and E. Solow, Macroeconomics: Principles and Policy. Cengage Learning, 2018."),
      para("[7] Google LLC, Firebase Documentation: Cloud Firestore, Authentication, and Hosting. [Online]. Available: https://firebase.google.com/docs. [Accessed: March 2026]."),
      para("[8] Meta Open Source, React Documentation. [Online]. Available: https://react.dev. [Accessed: March 2026]."),
      para("[9] Tailwind Labs, Tailwind CSS Documentation. [Online]. Available: https://tailwindcss.com/docs. [Accessed: March 2026]."),
      para("[10] Vitejs, Vite Documentation. [Online]. Available: https://vitejs.dev. [Accessed: March 2026]."),
      para("[11] Masvingo Polytechnic. (n.d.). Official Institutional Website. [Online]. Available: https://www.masvingopoly.ac.zw. [Accessed: March 2026]."),
      para("[12] U.S. Department of Health and Human Services, HIPAA for Professionals. [Online]. Available: https://www.hhs.gov/hipaa/for-professionals. [Accessed: March 2026]."),
      para("[13] U.S. Department of Education, Family Educational Rights and Privacy Act (FERPA). [Online]. Available: https://www2.ed.gov/policy/gen/guid/fpco/ferpa. [Accessed: March 2026]."),
      pageBreak(),

      // ═══════════════════ APPENDICES ══════════════════════════════════════
      h1("Appendices"),
      h2("List of Appendices"),
      para("Appendix A: Observation Sheet ..................................................................................................... 50"),
      para("Appendix B: Sample Questionnaire ............................................................................................... 52"),
      para("Appendix C: End-User Manuals .................................................................................................... 54"),
      para("Appendix D: Code Snippets .......................................................................................................... 60"),
      pageBreak(),

      // APPENDIX A
      h2("Appendix A: Observation Sheet"),
      bold("Observation Sheet — Masvingo Poly Clinical Portal Project"),
      ...emptyLine(1),
      makeTable(
        ["Field", "Details"],
        [
          ["Project Title","Masvingo Poly Clinical Portal"],
          ["Date of Observation","[November 2025]"],
          ["Observer","Memory Mufambi"],
          ["Observation Setting","Masvingo Polytechnic On-Campus Clinic"],
          ["Observation Time","8:00 AM – 12:00 PM"],
          ["Observation Duration","4 Hours"],
          ["Observation Focus","Clinical Intake, Pharmacy Dispensing, and Record Management"],
        ],
        [2800, 6026]
      ),
      ...emptyLine(1),
      bold("Observation Notes:"),
      numbered("Clinical Intake Queue:"),
      bullet("The physical intake queue regularly exceeded 10 patients at peak morning hours."),
      bullet("Average waiting time from arrival to consultation was observed to be between 35 and 50 minutes."),
      bullet("No digital or electronic queue management system was in use; patients were served strictly in order of physical arrival."),
      bullet("Patients had no way of knowing their queue position or estimated waiting time without physically being present."),
      numbered("Record Management:"),
      bullet("The medical officer manually retrieved paper files from physical filing cabinets for each patient, taking 3 to 8 minutes per retrieval."),
      bullet("New patients required a new paper file to be created, causing additional delays."),
      bullet("All consultation notes were handwritten on paper forms."),
      bullet("No electronic copy of any patient record was observed to exist."),
      numbered("Pharmacy Dispensing:"),
      bullet("The pharmacist manually checked physical stock shelves before dispensing medication."),
      bullet("The dispensary ledger showed inconsistent entries; some transactions lacked an authorising signature and date."),
      bullet("No automated stock level alerts were in place; stockouts were discovered only when a medication was physically absent from the shelf."),
      numbered("Medical Certificates and Sick Notes:"),
      bullet("Sick notes were typed or handwritten manually and handed directly to the patient."),
      bullet("No structured electronic copy was retained; records existed only as the physical document given to the patient."),
      numbered("Overall Perceptions:"),
      bullet("The clinical service was clearly operating under significant administrative strain attributable to the manual process."),
      bullet("The introduction of a digital system was expected to reduce waiting times to under 10 minutes and eliminate all manual record-keeping tasks."),
      pageBreak(),

      // APPENDIX B
      h2("Appendix B: Sample Questionnaire"),
      bold("Dear Participant,"),
      para("We are conducting a survey to gather feedback on the clinical services at Masvingo Polytechnic and to understand your requirements for a proposed digital clinical management system. Your feedback is valuable and will directly inform the design of the new system. Please take a few minutes to answer the following questions."),
      ...emptyLine(1),
      numbered("How often do you visit the Masvingo Polytechnic clinic?"),
      bullet("Every semester"),
      bullet("Once or twice a year"),
      bullet("Rarely"),
      bullet("Never"),
      numbered("How satisfied are you with the current physical queuing system at the clinic?"),
      bullet("Very satisfied"),
      bullet("Satisfied"),
      bullet("Neutral"),
      bullet("Dissatisfied"),
      bullet("Very dissatisfied"),
      numbered("Have you ever been unable to access your own medical record or certificate from the clinic without physically visiting? (Yes / No)"),
      numbered("How important is it to you to be able to book clinic appointments online? (Rate 1 = Not important, 5 = Very important)"),
      numbered("Would you use an online appointment booking system if available? (Yes / No)"),
      numbered("How important is it to you that your mental health consultation records are kept strictly separate from your academic records? (Rate 1–5)"),
      numbered("How comfortable would you be accessing mental wellness support through a confidential online portal?"),
      bullet("Very comfortable"),
      bullet("Comfortable"),
      bullet("Neutral"),
      bullet("Uncomfortable"),
      bullet("Very uncomfortable"),
      numbered("What is the most critical feature you would want in a digital clinical portal? (Select all that apply)"),
      bullet("Online appointment booking"),
      bullet("Access to my medical records and certificates"),
      bullet("Online sick note application"),
      bullet("Confidential mental wellness support"),
      bullet("Real-time queue status / estimated waiting time"),
      numbered("Have you experienced delays in obtaining a sick note or medical certificate from the clinic? (Yes / No). If yes, please describe:"),
      numbered("Would you recommend the development of a digital clinical portal for Masvingo Polytechnic? (Yes / No)"),
      ...emptyLine(1),
      para("Thank you for taking the time to complete this survey. Your feedback is greatly appreciated and will be used to improve the quality of clinical services at Masvingo Polytechnic."),
      pageBreak(),

      // APPENDIX C
      h2("Appendix C: End-User Manuals"),
      h3("C.1 Administrator Quick Reference Guide (Dr. Nyoni)"),
      h4("How to Process a Patient Through Clinical Intake:"),
      ...emptyLine(1),
      placeholder("Screenshot: DOCTOR'S DASHBOARD / QUEUE PAGE — Paste the screenshot of the Doctor's dashboard showing the 'CLINICAL INTAKE — MANAGING THE DAILY PATIENT FLOW' header, the 'NO ACTIVE CONSULTATION SESSION' state or an active session with a patient's details, and the 'CURRENT WAITING LIST' showing a patient card (e.g., ADMIRE MUFAMBI, GENERAL ILLNESS, with ADMIT PATIENT button). This is the Dr. Nyoni / Doctor role view from the actual app."),
      ...emptyLine(1),
      numbered("Log in using your Doctor credentials (email and password)."),
      numbered("Navigate to 'Queue' in the left sidebar."),
      numbered("The Current Waiting List displays all patients currently waiting for consultation."),
      numbered("Click 'Admit Patient' next to the first patient in the list. The system creates an active consultation session in Firestore."),
      numbered("The patient's details appear in the 'Active Consultation Session' panel. Conduct the consultation."),
      numbered("On the Doctor's Consultation Page: select the Body Area, record Vitals (Temperature, Heart Rate, Blood Pressure, Pain Level), select Specific Part and Symptoms, and enter the Diagnosis."),
      numbered("Click 'Log Consultation' to record the clinical log and close the consultation."),
      numbered("To issue a sick note from within the session, click 'Issue Sick Note', enter the effective dates and clinical notes, and confirm."),
      numbered("Click 'End Session' to mark the consultation as complete. The patient is removed from the queue and all real-time views update."),
      ...emptyLine(1),
      placeholder("Screenshot: DOCTOR'S CONSULTATION PAGE — Paste the full screenshot of the Doctor's consultation page showing: the ACTIVE CONSULTATION banner with the patient's name, faculty, and time; the Body Area selector panel (HEAD AND NECK highlighted, CHEST, ABDOMEN, ARMS AND HANDS, LEGS AND FEET, SKIN); the Vitals panel with Temperature (36.6C), Heart Rate (72 bpm), Systolic BP (120), Diastolic BP (80), Pain Level slider; the Specific Part selector with FOREHEAD highlighted; and the Diagnosis section with condition tags (MALARIA, UPPER RESPIRATORY TRACT INFECTION, INFLUENZA-LIKE ILLNESS). Actual app screenshot."),
      ...emptyLine(1),
      h4("How to Manage Pharmacy Inventory:"),
      ...emptyLine(1),
      placeholder("Screenshot: PHARMACY CONTROL PAGE — Paste the full screenshot of the Pharmacy Control page showing the 'PHARMACY CONTROL — MEDICAL SUPPLY INVENTORY' header, filter controls (Filter by Name, ALL dropdown, ALL STATUS dropdown, New Item button), and the full medication table with columns: MEDICINE COMPONENT, CATEGORY, UNITS, REGISTRY (showing green OPTIMAL badges and one red REPLENISH NOW badge for Oral Glucose Gel/Tablets), ACTIONS (EDIT, DELETE). Medications listed include: 70% Isopropyl Alcohol, Oral Glucose Gel/Tablets, Epinephrine (Epi-Pen), Salbutamol Inhaler, Ibuprofen, Povidone-Iodine, Antibiotic Ointment, Cough Suppressant, Antacid, Aromatic Spirit of Ammonia, Paracetamol, Hydrogen Peroxide. Actual app screenshot."),
      ...emptyLine(1),
      numbered("Navigate to 'Pharmacy' in the left sidebar."),
      numbered("The Pharmacy Control page displays all current medication inventory with their status."),
      numbered("To add a new item: click 'New Item', fill in Medicine Component, Category, and initial Units, then save."),
      numbered("To update stock after receiving a replenishment: click 'Edit' next to the item, update the Units field, and save."),
      numbered("Items displaying a red 'REPLENISH NOW' badge have fallen below the replenishment threshold and require immediate restocking."),
      numbered("To view the full dispensary history and filter by date, navigate to 'History' in the left sidebar."),
      ...emptyLine(1),
      h4("How to Approve a Sick Note Application:"),
      ...emptyLine(1),
      placeholder("Screenshot: SICK NOTE MANAGEMENT PAGE — Paste the screenshot of the Administrator's sick note management view (accessible from the Clinical Intake page or a dedicated Sick Notes tab). Should show a list of sick note applications with: student name, the stated reason (e.g., 'Malaria', 'Sickness', 'Feeling Sick'), the date range, and action buttons: 'APPROVE NOTE' (green) and a reject option. Some entries should show 'VERIFIED' green badges for already-approved notes. Actual app screenshot."),
      ...emptyLine(1),
      numbered("Sick note applications from students will appear in the administrative notification area or the Sick Notes management view."),
      numbered("Review the student's name and the stated reason for the sick note application."),
      numbered("Click 'Approve Note' to issue the sick note digitally. The student's portal will update in real time to show 'APPROVED' status."),
      numbered("To decline, click 'Reject'. The student will see 'REJECTED' status on their portal."),
      pageBreak(),

      h3("C.2 Student/Faculty Patient Guide"),
      h4("How to Access Your Medical Records:"),
      ...emptyLine(1),
      placeholder("Screenshot: STUDENT HOME DASHBOARD — Paste the full screenshot of the Student/Patient Home Dashboard showing: the top banner with 'INSTITUTIONAL ACCESS LEVEL 1' badge and the patient's name in large text (e.g., 'ADMIRE MUFAMBI') and registration number. Below: the 'QUEUE DASHBOARD' card showing queue position 1, 'YOU ARE 1ST IN THE WAITING LIST', 'Joined This Queue' timestamp, and 'ESTIMATED WAIT: ~0 MINS'. Then: LEFT COLUMN: 'Medical Documents Vault' (with document icons and download buttons for referral letters/medical excuses) and 'Clinical Summary' (Consultations count, Certificates count). RIGHT COLUMN: 'Booking Tracker' (table with Status, Date, Countdown, Doctor, Condition) and 'CLINICAL LOG FEED' (entries like MALARIA, INFLUENZA, with 'Download Record' buttons). Actual app screenshot."),
      ...emptyLine(1),
      numbered("Log in with your student or faculty credentials."),
      numbered("Your Home dashboard displays your Medical Documents Vault on the left and your Clinical Log Feed on the right."),
      numbered("The Medical Documents Vault shows all uploaded medical documents issued to you, with download icons."),
      numbered("Click 'Download Record' next to any entry in the Clinical Log Feed to download your consultation record as a file."),
      ...emptyLine(1),
      h4("How to Book an Appointment:"),
      ...emptyLine(1),
      placeholder("Screenshot: MEDICAL HUB (BOOKING PAGE) — Paste the screenshot of the student's Medical Hub / Book page, showing: the 'MEDICAL HUB' header, 'Apply Sick Note' and 'Book Appointment' buttons at top right. LEFT PANEL: 'Current Status' — a list of upcoming appointments showing status (e.g., COUNSELING at 04:30 PM DOCTOR UNAVAILABLE, SEXUAL HEALTH at 09:00 AM DOCTOR UNAVAILABLE, SEXUAL HEALTH at 11:00 AM CANCELLED). RIGHT PANEL: 'Sick Note History' — a list of approved sick notes (SICKNESS - APPROVED, FEELING SICK - APPROVED, MALARIA - APPROVED). Actual app screenshot."),
      ...emptyLine(1),
      numbered("Navigate to 'Book' in the left sidebar."),
      numbered("Click 'Book Appointment'. A form will appear where you can select the Appointment Type, preferred Date, and Time."),
      numbered("Click 'Confirm'. Your appointment will appear in the 'Current Status' list with a 'CONFIRMED' status indicator."),
      numbered("To apply for a sick note, click 'Apply Sick Note', enter your reason and requested dates, and submit."),
      numbered("Your sick note application will appear in the 'Sick Note History' panel with a 'PENDING' status until approved or rejected by the medical officer."),
      ...emptyLine(1),
      h4("How to Use the Mental Wellness Hub:"),
      ...emptyLine(1),
      placeholder("Screenshot: MENTAL WELLNESS HUB — Paste the full screenshot of the Mental Wellness Hub page showing: the 'CONFIDENTIAL SUPPORT — MENTAL WELLNESS HUB' header with a 'COUNSELLOR ONLINE NOW' button at top right. A blue info banner: 'FERPA & HIPAA COMPLIANT. YOUR MENTAL HEALTH DATA IS KEPT STRICTLY SEPARATE FROM ACADEMIC RECORDS.' LEFT PANEL: 'Daily Mood Check-In' — showing the question 'HOW ARE YOU FEELING TODAY, TAFARA?' and five emoji circles labelled GREAT, GOOD, OKAY, LOW, CRISIS. Below that: 'Digital Mood Journal' — a text area labelled 'REFLECT ON YOUR THOUGHTS PRIVATELY: What's on your mind today?'. RIGHT PANEL: 'NEXT COUNSELLING' — showing a scheduled date (THUR, OCT 12, 10:00 AM, ROOM 6B, HEALTH UNIT) with Reschedule and Cancel Session buttons. Below: 'Support Resources' — coloured tiles for EXAM STRESS, SLEEP HYGIENE, SOCIAL ANXIETY, SUBSTANCE HELP. Actual app screenshot."),
      ...emptyLine(1),
      numbered("Navigate to 'Mental' in the left sidebar. All data in this section is strictly CONFIDENTIAL."),
      numbered("Your mental health data is FERPA and HIPAA compliant and is kept technically separate from all academic records."),
      numbered("Complete the Daily Mood Check-In by selecting your current mood from the five options: GREAT, GOOD, OKAY, LOW, or CRISIS."),
      numbered("Write a private reflection in the Digital Mood Journal text area. Your entries are visible only to you."),
      numbered("Review the Support Resources section for self-help materials on topics such as exam stress, sleep hygiene, social anxiety, and substance help."),
      numbered("If you are in CRISIS, select the CRISIS mood option to be connected to immediate support resources, or use the EMERGENCY CRISIS SYSTEM button on the login page for the fastest access to help."),
      pageBreak(),

      // APPENDIX D
      h2("Appendix D: Code Snippets"),
      h3("Authentication — Login Logic (TypeScript/React)"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: `const handleLogin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/home');
      }
    }
  } catch (error) {
    setSnackbar({ message: 'Invalid credentials. Please try again.', type: 'error' });
  }
};`, size: 18, font: "Courier New", color: "D4D4D4" })]
      }),

      ...emptyLine(1),
      h3("Firestore Security Rules — Mental Wellness Data Segregation"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Mental Wellness: STRICT patient-only access
    match /mentalWellness/{patientId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == patientId;
      // No admin, no other user can access this collection
    }
    
    // Clinical logs: patient can read, admin can read and write
    match /patients/{userId}/clinicalLogs/{logId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if isAdmin();
    }
    
    // Pharmacy: admin only
    match /pharmacy/{itemId} {
      allow read, write: if isAdmin();
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`, size: 18, font: "Courier New", color: "D4D4D4" })]
      }),

      ...emptyLine(1),
      h3("Real-Time Queue Listener (TypeScript/React)"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } },
        children: [new TextRun({ text: `useEffect(() => {
  const queueRef = collection(db, 'queue');
  const q = query(queueRef, where('status', '==', 'WAITING'), orderBy('timestamp', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const patients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setWaitingList(patients);
  });
  
  return () => unsubscribe(); // Cleanup on component unmount
}, []);`, size: 18, font: "Courier New", color: "D4D4D4" })]
      }),

      ...emptyLine(1),
      para("The complete source code for the Masvingo Poly Clinical Portal is maintained in the project's GitHub repository and is available to authorised institutional developers for review and future development."),

    ] // end children
  }] // end sections
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('MasPoly_Clinical_Portal_Documentation.docx', buffer);
  console.log('Document created successfully!');
});