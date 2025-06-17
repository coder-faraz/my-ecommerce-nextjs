import React, { Suspense } from "react";

import AllProducts from "./MainPage";
import Loading from "@/components/Loading";

//using suspense & fallback because used useParams hook in the main page
export default function AllProductsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <AllProducts />
        </Suspense>
    );
}
