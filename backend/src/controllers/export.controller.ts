import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';
import { executeSqlQuery } from '../services/query/execution.service';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const exportCsv = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const historyId = req.params.historyId as string;
    const data = await getQueryResultData(req.user!.id, historyId);
    
    if (data.rows.length === 0) {
      return res.status(200).send('No data');
    }

    const headers = data.fields.join(',');
    const csvRows = data.rows.map((row: any) => 
      data.fields.map((field: string) => JSON.stringify(row[field] ?? '')).join(',')
    );
    
    const csvContent = [headers, ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="export_${historyId}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const exportExcel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const historyId = req.params.historyId as string;
    const data = await getQueryResultData(req.user!.id, historyId);
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Results');
    
    sheet.columns = data.fields.map((f: string) => ({ header: f, key: f }));
    sheet.addRows(data.rows);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="export_${historyId}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export const exportPdf = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const historyId = req.params.historyId as string;
    const data = await getQueryResultData(req.user!.id, historyId);
    
    const doc = new PDFDocument({ margin: 30 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="export_${historyId}.pdf"`);
    
    doc.pipe(res);
    
    doc.fontSize(16).text('Query Results', { align: 'center' });
    doc.moveDown();
    
    if (data.rows.length > 0) {
      const headers = data.fields.join(' | ');
      doc.fontSize(10).text(headers, { underline: true });
      doc.moveDown(0.5);
      
      data.rows.forEach((row: any) => {
        const rowText = data.fields.map((f: string) => row[f] ?? '').join(' | ');
        doc.text(rowText);
      });
    } else {
      doc.text('No results found.');
    }
    
    doc.end();
  } catch (error) {
    next(error);
  }
};

async function getQueryResultData(userId: string, historyId: string) {
  const historyRecord = await prisma.queryHistory.findUnique({
    where: { id: historyId }
  });

  if (!historyRecord || historyRecord.userId !== userId) {
    throw new AppError('Query history not found', 404);
  }

  return await executeSqlQuery(historyRecord.generatedSQL);
}
