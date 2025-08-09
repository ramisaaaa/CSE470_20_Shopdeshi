import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const DATA_FILE = path.join(process.cwd(), 'products.json');

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const category = formData.get('category') as string;
  const imageFile = formData.get('image') as File;

  if (!name || !description || !price || !category || !imageFile) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Save image
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(imageFile.name) || '.png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const arrayBuffer = await imageFile.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  // Save product data
  let products = [];
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    products = JSON.parse(raw);
  } catch {}
  const newProduct = {
    id: Date.now().toString(),
    name,
    description,
    price,
    category,
    image: `/uploads/${fileName}`,
  };
  products.unshift(newProduct);
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));

  return NextResponse.json({ success: true, product: newProduct });
} 