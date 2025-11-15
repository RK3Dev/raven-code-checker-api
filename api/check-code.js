export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const targetUrl = 'https://raven.plus/MarketingStatisticsCode';
    
    const formData = new URLSearchParams();
    formData.append('code', code);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    let isValid = false;
    let details = '';
    let status = 'غير معروف';

    const lowerHtml = html.toLowerCase();
    
    if (lowerHtml.includes('غير صالح') || lowerHtml.includes('invalid') || 
        lowerHtml.includes('expired') || lowerHtml.includes('منتهي')) {
      isValid = false;
      status = 'غير صالح';
      details = 'الكود غير صالح أو منتهي الصلاحية';
    } else if (lowerHtml.includes('صالح') || lowerHtml.includes('valid') || 
               lowerHtml.includes('active') || lowerHtml.includes('نشط')) {
      isValid = true;
      status = 'صالح';
      details = 'الكود صالح ونشط';
    } else if (lowerHtml.includes('used') || lowerHtml.includes('مستخدم')) {
      isValid = false;
      status = 'مستخدم';
      details = 'الكود مستخدم مسبقاً';
    } else {
      details = 'تم فحص الكود';
      isValid = true;
      status = 'تم الفحص';
    }

    return res.status(200).json({
      code: code,
      success: isValid,
      status: status,
      details: details
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to check code',
      message: error.message
    });
  }
}
