import SeoDataView from "./seo/SeoDataView";
import ScoreCard from "./seo/ScoreCard";
import WebVitals from "./seo/WebVitals";
import Recommendations from "./seo/Recommedation";
const SeoMainView = ({ seoData }) => {
    return (
        <div>
            <div className="px-1 py-1">
                <ScoreCard score={seoData?.seoScore} lastScan={seoData?.timestamp} passSummary={seoData?.passSummary} recommendations={seoData?.recommendations} metaSummary={seoData?.metaSummary} updatedAt={seoData?.timestamp} />
            </div>

            <div className="px-1 py-1">
                <Recommendations recommendations={seoData?.recommendations}/>
            </div>

            <div className="px-1 py-1">
                <WebVitals/>
            </div>
            <div className="px-1 py-1">
                <SeoDataView seoData={seoData} />
            </div>
        </div>
    );
}

export default SeoMainView;