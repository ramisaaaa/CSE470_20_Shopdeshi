//import { Button } from '@/components/ui/button';
import React from 'react';
import Container from "@/components/Container";
import HomeBanner from '@/components/HomeBanner';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

import product1 from '../../images/products/product1.jpg';
import product2 from '../../images/products/product2.png';
import product3 from '../../images/products/product3.png';
import product4 from '../../images/products/product4.png';
import product5 from '../../images/products/product5.jpg';
import product6 from '../../images/products/product6.png';
import product7 from '../../images/products/product7.jpg';
import product8 from '../../images/products/product8.jpg';
import product9 from '../../images/products/product9.jpg';
import product10 from '../../images/products/product10.png';
import product11 from '../../images/products/product11.png';
import product12 from '../../images/products/product12.jpg';
import product13 from '../../images/products/product13.png';
import product14 from '../../images/products/product14.jpg';
import product15 from '../../images/products/product15.jpg';

const productImages = [
  product1, product2, product3, product4, product5,
  product6, product7, product8, product9, product10,
  product11, product12, product13, product14, product15
];

const productNames = [
  'Car Decorator Plushie', 'Lafufu', 'baby hammock', 'Crochet Bee', 'Diy multi_colored ribbons',
  'Cat hat', 'clay mirror', 'Crochet sushis', 'clay flower vase', 'cherry rug',
  'stitch', 'sage green rug', 'Dreamy lounge sofa', 'Crochet Chick Cup', 'cute cat giveaway'
];

const Home = () => {
  return (
    <div className="bg-pink-50 min-h-screen pb-10">
      <Container className="py-8">
        <HomeBanner />
        <h2 className="text-3xl font-bold text-center text-shop-dark-pink mt-12 mb-6">Shop Our Cutest Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productImages.map((src, idx) => (
            <Card key={idx} className="bg-white/80 border-pink-200 shadow-pink-100 hover:shadow-lg transition-all">
              <CardContent className="flex flex-col items-center p-4">
                <Image src={src} alt={productNames[idx]} width={180} height={180} className="rounded-lg object-cover mb-4" />
                <CardTitle className="text-lg text-shop-dark-pink mb-2 text-center">{productNames[idx]}</CardTitle>
                <CardFooter className="w-full flex justify-center p-0">
                  <Link href="/shop" className="px-4 py-1.5 rounded bg-pink-200 text-shop-dark-pink font-semibold hover:bg-pink-300 transition">Shop</Link>
                </CardFooter>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default Home;