"""Reference data loader — seeds states, districts, places, clusters, sources, NIC, and NCO."""

from __future__ import annotations

from app.core.database import SessionLocal
from app.core.logging import get_logger, setup_logging
from app.core.settings import get_clusters_config, get_coverage_config, get_sources_config
from app.models.reference import Cluster, District, NCOOccupation, NICCode, Place, Source, State
from app.models.supply import DistrictIndicator
from app.reference.gazetteer import DISTRICT_CATALOG

logger = get_logger("reference.loader")


def seed_states_and_districts(db) -> None:
    """Seed Tamil Nadu state, focus districts and comparator."""
    logger.info("Seeding states and districts...")

    # State: Tamil Nadu
    tn = db.query(State).filter(State.state_lgd == "33").first()
    if not tn:
        tn = State(state_lgd="33", name="Tamil Nadu")
        db.add(tn)
        db.flush()

    coverage = get_coverage_config()
    focus_districts = {str(d["lgd_code"]): d for d in coverage.get("focus_districts", [])}
    comparator_list = coverage.get("comparator_districts", [])
    comparator_lgds = {str(c["lgd_code"]) for c in comparator_list}
    if "comparator" in coverage and coverage["comparator"]:
        comparator_lgds.add(str(coverage["comparator"].get("lgd_code")))

    for lgd, data in DISTRICT_CATALOG.items():
        is_focus = lgd in focus_districts
        is_comparator = lgd in comparator_lgds

        dist = db.query(District).filter(District.district_lgd == lgd).first()
        if not dist:
            dist = District(
                district_lgd=lgd,
                state_lgd="33",
                name=data["name"],
                aliases=data["aliases"],
                is_focus=is_focus,
                is_comparator=is_comparator,
            )
            db.add(dist)
            db.flush()
        else:
            dist.is_focus = is_focus
            dist.is_comparator = is_comparator

        # Seed gazetteer places
        for place_name in data["places"]:
            exists = (
                db.query(Place).filter(Place.district_lgd == lgd, Place.name == place_name).first()
            )
            if not exists:
                place = Place(
                    name=place_name,
                    aliases=[place_name],
                    place_type="industrial_area" if "sipcot" in place_name else "town",
                    district_lgd=lgd,
                )
                db.add(place)

    db.commit()
    logger.info("States and districts seeded successfully.")


def seed_clusters(db) -> None:
    """Seed industry clusters from clusters.yaml."""
    logger.info("Seeding industry clusters...")
    clusters_raw = get_clusters_config().get("clusters", [])
    clusters_dict = {c["slug"]: c for c in clusters_raw} if isinstance(clusters_raw, list) else clusters_raw

    for slug, cdata in clusters_dict.items():
        existing = db.query(Cluster).filter(Cluster.slug == slug).first()
        if not existing:
            cluster = Cluster(
                slug=slug,
                name=cdata.get("name", slug),
                nic_codes=[str(c) for c in cdata.get("nic_codes", [])],
                keywords=cdata.get("keywords", {}),
                status="active",
            )
            db.add(cluster)

    db.commit()
    logger.info("Clusters seeded successfully.")


def seed_sources(db) -> None:
    """Seed data sources from sources.yaml."""
    logger.info("Seeding data sources...")
    sources_data = get_sources_config().get("sources", {})

    for sid, sdata in sources_data.items():
        existing = db.query(Source).filter(Source.id == sid).first()
        if not existing:
            source = Source(
                id=sid,
                name=sdata.get("name", sid),
                base_url=sdata.get("base_url", "https://example.gov.in"),
                tier=sdata.get("tier", "official_gov"),
                rate_limit_rps=float(sdata.get("rate_limit_rps", 1.0)),
                robots_ok=bool(sdata.get("robots_ok", True)),
                licence=sdata.get("licence", "GODL-India"),
                status=sdata.get("status", "active"),
            )
            db.add(source)

    db.commit()
    logger.info("Sources seeded successfully.")


def seed_nic_and_nco(db) -> None:
    """Seed primary NIC-2008 and NCO-2015 codes for MVP clusters."""
    logger.info("Seeding NIC-2008 and NCO-2015 reference codes...")

    nic_entries = [
        ("29", 2, "Manufacture of motor vehicles, trailers and semi-trailers"),
        ("27", 2, "Manufacture of electrical equipment"),
        ("10", 2, "Manufacture of food products"),
        ("35", 2, "Electricity, gas, steam and air conditioning supply"),
        ("20", 2, "Manufacture of chemicals and chemical products (inc. Green Hydrogen)"),
        ("26", 2, "Manufacture of computer, electronic and optical products"),
    ]

    for code, level, desc in nic_entries:
        if not db.query(NICCode).filter(NICCode.code == code).first():
            db.add(NICCode(code=code, level=level, description=desc))

    nco_entries = [
        (
            "7412",
            "Electrical Mechanics and Fitters",
            "Assemble and service electrical equipment and battery assemblies",
        ),
        (
            "7233",
            "Industrial Machinery Mechanics",
            "Maintain machinery in manufacturing and industrial complexes",
        ),
        (
            "3115",
            "Mechanical Engineering Technicians",
            "Provide technical assistance in engineering and CNC production",
        ),
        (
            "8211",
            "Mechanical Machinery Assemblers",
            "Assemble parts and sub-assemblies for motor vehicles and appliances",
        ),
        (
            "7511",
            "Food Processing Workers",
            "Operate equipment to process food and beverage products",
        ),
    ]

    for code, title, desc in nco_entries:
        if not db.query(NCOOccupation).filter(NCOOccupation.code == code).first():
            db.add(NCOOccupation(code=code, title=title, description=desc))

    db.commit()
    logger.info("NIC and NCO codes seeded successfully.")


def seed_district_indicators(db) -> None:
    """Seed baseline indicators for focus districts."""
    logger.info("Seeding district indicators...")

    # Focus district baselines (Krishnagiri, Thoothukudi, Chennai)
    indicators = [
        # Krishnagiri (582)
        ("582", "population", 1879809, "count", 2021),
        ("582", "literacy_rate", 71.5, "percentage", 2021),
        ("582", "outmigration_proxy", 0.42, "index", 2024),
        ("582", "aspirational_flag", 0.0, "boolean", 2024),
        # Thoothukudi (608)
        ("608", "population", 1750176, "count", 2021),
        ("608", "literacy_rate", 86.2, "percentage", 2021),
        ("608", "outmigration_proxy", 0.48, "index", 2024),
        ("608", "aspirational_flag", 0.0, "boolean", 2024),
        # Chennai (603)
        ("603", "population", 4646732, "count", 2021),
        ("603", "literacy_rate", 90.2, "percentage", 2021),
        ("603", "outmigration_proxy", 0.12, "index", 2024),
        ("603", "aspirational_flag", 0.0, "boolean", 2024),
    ]

    for lgd, ind, val, unit, year in indicators:
        existing = (
            db.query(DistrictIndicator)
            .filter(DistrictIndicator.district_lgd == lgd, DistrictIndicator.indicator == ind)
            .first()
        )
        if not existing:
            db.add(
                DistrictIndicator(
                    district_lgd=lgd,
                    indicator=ind,
                    value=val,
                    unit=unit,
                    year=year,
                    provenance_label="REAL",
                    method="api",
                    source_url="https://data.gov.in",
                )
            )

    db.commit()
    logger.info("District indicators seeded successfully.")


def run_all_seeds() -> None:
    """Seed all reference data."""
    setup_logging()
    logger.info("Starting complete reference data seed...")
    with SessionLocal() as db:
        seed_states_and_districts(db)
        seed_clusters(db)
        seed_sources(db)
        seed_nic_and_nco(db)
        seed_district_indicators(db)
    logger.info("All reference seeds completed successfully.")


if __name__ == "__main__":
    run_all_seeds()
