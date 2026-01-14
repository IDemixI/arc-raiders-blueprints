import BlueprintGrid from "@/components/BlueprintGrid";
import data from "@/data/blueprints.json";

export default function Page() {
  const blueprints = data as { id: string; name: string; category: string; rarity?: string }[];

  return (
    <>
      <header className="bp-header">
        <div className="bp-title">
          <h1>BLUEPRINTS</h1>
          <div className="found">
            FOUND: <strong id="foundCount">0</strong>/<strong id="foundTotal">{blueprints.length}</strong>
          </div>
        </div>
        <div className="bp-controls">
          <input id="searchInput" type="search" placeholder="Search…" aria-label="Search blueprints" />
          <select id="statusFilter" aria-label="Filter by status">
            <option value="">All</option>
            <option value="unknown">Unknown</option>
            <option value="need">Need</option>
            <option value="learned">Learned</option>
          </select>
        </div>
      </header>

      <main className="bp-main">
        <BlueprintGrid initialBlueprints={blueprints} />
      </main>

      <footer className="bp-footer">
        <p>Fan-made UI. No official assets used.</p>
      </footer>
    </>
  );
}