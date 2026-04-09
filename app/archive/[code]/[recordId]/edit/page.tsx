import { notFound } from "next/navigation";

import EditRecordClientPage from "@/app/archive/EditRecordClientPage";
import { getArchiveRecordDetailPageData } from "@/lib/supabase/archive";

type EditArchiveRecordPageProps = {
  params: Promise<{
    code: string;
    recordId: string;
  }>;
};

// 这是“编辑已有档案”的页面入口。
// 先把数据库里的当前 record 读出来，再交给客户端表单做预填编辑。
export default async function EditArchiveRecordPage({
  params,
}: EditArchiveRecordPageProps) {
  const { code, recordId } = await params;
  const pageData = await getArchiveRecordDetailPageData(code, recordId);

  if (!pageData) {
    notFound();
  }

  const { section, record } = pageData;

  return (
    <EditRecordClientPage
      sectionSlug={section.slug}
      recordId={record.id}
      title={record.title}
      teaser={record.teaser}
      recordDate={record.date ?? ""}
      status={record.status}
      stage={record.stage}
      shareType={record.shareType}
      shareRound1={record.shareRound1.toString()}
      shareRound2={record.shareRound2?.toString() ?? ""}
      shipping={record.shipping.toString()}
      notes={record.notes}
      characterTags={record.characterTags.join(", ")}
      tags={record.tags.join(", ")}
      promoImage={record.gallery.promo.image ?? ""}
      sampleImage={record.gallery.sample.image ?? ""}
      bulkImage={record.gallery.bulk.image ?? ""}
      resultImage={record.gallery.result.image ?? ""}
      items={record.items.map((item) => ({
        id: item.id,
        title: item.title,
        unitPrice: item.unitPrice.toString(),
        image: item.image ?? "",
      }))}
    />
  );
}
