import React, { Suspense } from "react";

import Product from "./MainPage";
import Loading from "@/components/Loading";

//using suspense & fallback because used useParams hook in the main page
export default function ProductPage() {
    return (
        <Suspense fallback={<Loading />}>
            <Product />
        </Suspense>
    );
}
