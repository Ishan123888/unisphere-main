package com.unisphere.booking.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.unisphere.booking.model.Booking;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class ReportService {

    public ByteArrayInputStream generateBookingInvoice(Booking booking) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font Styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.BLUE);
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);

            // Title Section
            Paragraph title = new Paragraph("UniSphere Portal - Invoice", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // Table Settings
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            // Headers
            addTableHeader(table, headFont, "Description");
            addTableHeader(table, headFont, "Details");

            // Data Rows
            table.addCell("Booking Reference");
            table.addCell(booking.getBookingRef() != null ? booking.getBookingRef() : "N/A");

            table.addCell("Student Name");
            table.addCell(booking.getStudentName());

            table.addCell("Tutor Name");
            table.addCell(booking.getTutorName());

            table.addCell("Subject");
            table.addCell(booking.getSubject());

            // FIX: Convert LocalDateTime to String
            table.addCell("Scheduled Slot");
            String formattedDate = booking.getScheduledSlot() != null
                    ? booking.getScheduledSlot().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                    : "Not Scheduled";
            table.addCell(formattedDate);

            // FIX: Use getTotalPrice() instead of getTotalAmount()
            table.addCell("Total Price");
            String price = booking.getTotalPrice() != null ? "Rs. " + booking.getTotalPrice().toString() : "Rs. 0.00";
            table.addCell(price);

            document.add(table);
            document.close();

        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTableHeader(PdfPTable table, Font font, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BaseColor.DARK_GRAY);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }
}