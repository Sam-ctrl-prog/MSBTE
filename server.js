const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
const port = 3000;

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Life',
    database: 'TPO'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database.');
    }
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the TC.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'TC.html'));
});

// API to fetch TC details by enrollment number
app.get('/fetch_tc', (req, res) => {
    const { enrollmentNo } = req.query;

    if (!enrollmentNo) {
        return res.status(400).json({ success: false, message: 'Enrollment number is required.' });
    }

    const query = `
        SELECT EnrollmentNo, Name, RaceCaste, Nationality, PlaceOfBirth, DOB, LastAttendedSchool, 
               DateOfAdmission, Progress, Conduct, DateOfLeaving, CourseYear, ReasonForLeaving, Remark 
        FROM TC
        WHERE EnrollmentNo = ?
    `;
    db.query(query, [enrollmentNo], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        res.json({ success: true, data: results });
    });
});

// API to generate PDF
app.get('/generate_pdf', (req, res) => {
    const { enrollmentNo } = req.query;

    if (!enrollmentNo) {
        return res.status(400).json({ success: false, message: 'Enrollment number is required.' });
    }

    const query = `
        SELECT EnrollmentNo, Name, RaceCaste, Nationality, PlaceOfBirth, DOB, LastAttendedSchool, 
               DateOfAdmission, Progress, Conduct, DateOfLeaving, CourseYear, ReasonForLeaving, Remark 
        FROM TC 
        WHERE EnrollmentNo = ?
    `;
    db.query(query, [enrollmentNo], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No data found for the given enrollment number.' });
        }

        const student = results[0];
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filePath = path.join(__dirname, 'public', 'TC.pdf');

        doc.pipe(fs.createWriteStream(filePath));

        // Path to the logo image
        const logoPath = path.join(__dirname, 'public', 'logo.jpeg'); // Replace 'logo.jpeg' with the actual filename

        // Add watermark on the page
        doc.image(logoPath, 200, 300, { width: 200, opacity: 0.1 }); // Adjust size and positioning for watermark

        // Header Section with Logo
        doc.image(logoPath, 50, 40, { width: 50 }) // Logo on the left
            .fillColor('#1f4e79')
            .font('Helvetica-Bold')
            .fontSize(18)
            .text('Government Polytechnic of Dharashiv', 120, 50, { align: 'center' })
            .fontSize(8)
            .text('(Prescribed by Rules 14, Chapter 11, Section 11, In the Grant-in-Aid Code)', { align: 'center' })
            .fontSize(12)
            .text('Address: XYZ Road, Dharashiv, Maharashtra - 413601', { align: 'center' });

        doc.moveDown(1);
        doc.fontSize(17).fillColor('#4a90e2').text('Transfer Certificate', { align: 'center', underline: true });
        doc.strokeColor('#1f4e79').lineWidth(1.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);

        // Student Information
        doc.fillColor('black').font('Helvetica-Bold').fontSize(12).text('Student Details:', { underline: true });
        doc.moveDown(0.5);

        // Student Details Table with Spacing
        const details = [
            { label: 'Enrollment No', value: student.EnrollmentNo },
            { label: 'Name', value: student.Name },
            { label: 'Race/Caste', value: student.RaceCaste },
            { label: 'Nationality', value: student.Nationality },
            { label: 'Place of Birth', value: student.PlaceOfBirth },
            { label: 'Date of Birth', value: student.DOB },
            { label: 'Last Attended School', value: student.LastAttendedSchool },
            { label: 'Date of Admission', value: student.DateOfAdmission },
            { label: 'Progress', value: student.Progress },
            { label: 'Conduct', value: student.Conduct },
            { label: 'Date of Leaving', value: student.DateOfLeaving },
            { label: 'Course Year', value: student.CourseYear },
            { label: 'Reason for Leaving', value: student.ReasonForLeaving },
            { label: 'Remark', value: student.Remark },
        ];

        details.forEach(({ label, value }) => {
            doc.font('Helvetica-Bold').text(`${label}:`, { continued: true });
            doc.font('Helvetica').text(` ${value || 'N/A'}`);
            doc.moveDown(0.5); // Add spacing between details
        });

        doc.moveDown(1.5);

        // Footer
        doc.fillColor('black').font('Helvetica-Bold').fontSize(12)
            .text('Date:', { align: 'left' })
            .text('Certified that the above information is true as per institute records.', { align: 'center' });
        doc.moveDown(1.5);

        // Footer Signatures
        doc.strokeColor('#1f4e79').lineWidth(1.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);
        doc.text('Prepared by                Checked by                  Register                     Principal');

        doc.end();
        doc.on('finish', () => {
            res.json({ success: true, message: 'PDF generated successfully', filePath: '/TC.pdf' });
        });
    });
});

// API to fetch and download the PDF
app.get('/download_pdf', (req, res) => {
    const { filePath } = req.query;

    if (!filePath) {
        return res.status(400).json({ success: false, message: 'File path is required.' });
    }

    const fullPath = path.join(__dirname, 'public', filePath);
    if (fs.existsSync(fullPath)) {
        res.download(fullPath, 'Transfer_Certificate.pdf', (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
        });
    } else {
        res.status(404).json({ success: false, message: 'File not found.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
