export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-[24px] font-bold text-artdear-text">{title}</h1>
      <p className="mt-1 text-[14px] text-artdear-text-subtle">관리 기능 준비 중입니다.</p>

      <div className="mt-8 rounded-[22px] border border-dashed border-artdear-border-strong bg-artdear-card p-12 text-center">
        <p className="text-[14px] text-artdear-text-light">{title} 관리 화면</p>
      </div>
    </div>
  );
}
