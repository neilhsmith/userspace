type FeedLayoutProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export function FeedLayout({ children, sidebar }: FeedLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">{children}</div>
      <aside className="w-full lg:w-80 shrink-0">{sidebar}</aside>
    </div>
  );
}
