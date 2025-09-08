"use client";

import { Hero, SearchBar, CustomFilter, CarCard, ShowMore } from '@/components';
import { fuels, yearsOfProduction } from '@/constants';
import { fetchCars } from '@/utils';
import { useEffect, useState } from 'react';

// Tipare pentru Next App Router (searchParams async)
type SearchParams = Record<string, string | string[] | undefined>;

type HomeProps = {
  searchParams: SearchParams; // ❗️Nu Promise<SearchParams>
};

export default function Home({ searchParams }: HomeProps) {
  const str = (v: string | string[] | undefined, d = '') =>
    Array.isArray(v) ? (v[0] ?? d) : (v ?? d);

  const toNumOrUndef = (v: string | string[] | undefined) => {
    const n = Number(str(v));
    return Number.isFinite(n) ? n : undefined;
  };

  const num = (v: string | string[] | undefined, d: number) => {
    const n = Number(str(v));
    return Number.isFinite(n) && n > 0 ? n : d;
  };

  const manufacturer = str(searchParams.manufacturer, '');
  const model = str(searchParams.model, '');
  const yearNum = toNumOrUndef(searchParams.year);
  const fuel = str(searchParams.fuel, '');
  const limit = num(searchParams.limit, 10);

  const [allCars, setAllCars] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cars = await fetchCars({
          manufacturer,
          model,
          year: yearNum ?? 2020,
          fuel,
        
        });
        setAllCars(cars);
      } catch (error) {
        console.error("Error fetching cars:", error);
        setAllCars([]);
      }
    };

    fetchData();
  }, [manufacturer, model, yearNum, fuel, limit]);

  const isDataEmpty = !Array.isArray(allCars) || allCars.length < 1;

  return (
    <main className="overflow-hidden">
      <Hero />

      <div className="mt-12 padding-x padding-y max-width" id="discover">
        <div className="home__text-container">
          <h1 className="text-4xl font-extrabold">Car Catalog</h1>
          <p>Explore the cars you might like</p>
        </div>

        <div className="home__filters">
          <SearchBar />
          <div className="home__filter-container">
            <CustomFilter title="fuel" options={fuels} />
            <CustomFilter title="year" options={yearsOfProduction} />
          </div>
        </div>

        {!isDataEmpty ? (
          <section>
            <div className="home__cars-wrapper">
              {allCars.map((car: any, idx: number) => (
                <CarCard
                  key={
                    car.id ??
                    `${car.make ?? 'mk'}-${car.model ?? 'md'}-${car.year ?? 'yr'}-${car.drive ?? 'dr'}-${idx}`
                  }
                  car={car}
                />
              ))}
            </div>

            <ShowMore
              pageNumber={limit / 10}
              isNext={limit > allCars.length}
            />
          </section>
        ) : (
          <div className="home__error-container">
            <h2 className="text-black text-xl font-bold">Oops, no result</h2>
            {/* dacă API-ul tău atașează un message */}
            {/* @ts-ignore */}
            <p>{allCars?.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
