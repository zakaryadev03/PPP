const fs = require('fs');
const readline = require('readline');
const path = require('path');
const puppeteer = require('puppeteer');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Read the HTM file
fs.readFile('test.htm', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading HTM file:', err);
        return;
    }

    // Define the placeholders you want to replace
    const placeholders = [
        '{Name}', '{Titre_parcours}', '{time}', '{Parcours_text}',
        '{Titre_formation}', '{formation_time}', '{Detail}',
        '{P1}', '{P2}', '{P3}', '{Variable2}', '{716-555-0000}',
        '{Lien }', '{Email}', 'cat.png'
    ];

    // Function to recursively ask for user input for each placeholder
    function askUserInput(index, replacements) {
        if (index >= placeholders.length) {
            // All replacements done, perform the replacements and write the modified HTM to a new file
            let modifiedHTM = data;
            placeholders.forEach((placeholder, i) => {
                modifiedHTM = modifiedHTM.replace(new RegExp(placeholder, 'g'), replacements[i]);
            });
            fs.writeFile('modified_file.htm', modifiedHTM, (err) => {
                if (err) {
                    console.error('Error writing modified HTM:', err);
                    return;
                }
                console.log('HTM file has been modified successfully.');

                // Generate PDF from modified HTM
                generatePDF('modified_file.htm', 'output.pdf')
                    .then(() => console.log('PDF generated successfully!'))
                    .catch(error => console.error('Error generating PDF:', error));

                rl.close(); // Close readline interface
            });
            return;
        }

        // Ask user for input for the current placeholder
        rl.question(`Enter replacement for ${placeholders[index]}: `, (answer) => {
            replacements.push(answer);
            askUserInput(index + 1, replacements); // Ask for the next replacement
        });
    }

    // Start asking user input for replacements
    askUserInput(0, []);
});

// Function to generate PDF from HTML file
async function generatePDF(htmlFileName, outputFilePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Get the absolute path of the HTML file
    const htmlFilePath = path.resolve(__dirname, htmlFileName);

    // Load HTML file
    await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle0' });

    // Generate PDF with proper options
    await page.pdf({
        path: outputFilePath,
        format: 'A4',
        printBackground: true, // Enable printing of background elements
        displayHeaderFooter: false, // Disable header and footer
        margin: {
            top: '0.5cm',
            bottom: '0.5cm',
            left: '0.5cm',
            right: '0.5cm'
        }
    });

    await browser.close();
}
