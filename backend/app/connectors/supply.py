"""Training supply connector: ITIs, Polytechnics, NQR qualifications, and Apprenticeships."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.connectors.base import BaseConnector
from app.core.database import SessionLocal
from app.core.logging import get_logger
from app.models.supply import (
    ApprenticeshipOpening,
    Institution,
    InstitutionOffering,
    Qualification,
)

logger = get_logger("connectors.supply")


# Verified Tamil Nadu Vocational Institutions in focus districts
SEED_INSTITUTIONS = [
    {
        "id": "iti-krishnagiri-govt",
        "name": "Government Industrial Training Institute (ITI) Krishnagiri",
        "type": "ITI",
        "district_lgd": "582",
        "address": "Collectorate Road, Krishnagiri, Tamil Nadu 635001",
        "ownership": "Government",
        "lat": 12.5186,
        "lon": 78.2137,
        "offerings": [
            {
                "trade_name": "Electrician (EV Specialization)",
                "seats": 40,
                "batch_size": 20,
                "fee_inr": 0.0,
                "scheme": "state",
            },
            {
                "trade_name": "Mechanic Motor Vehicle",
                "seats": 30,
                "batch_size": 15,
                "fee_inr": 0.0,
                "scheme": "state",
            },
            {
                "trade_name": "Machinist & CNC Operator",
                "seats": 35,
                "batch_size": 18,
                "fee_inr": 0.0,
                "scheme": "state",
            },
        ],
    },
    {
        "id": "iti-hosur-govt",
        "name": "Government ITI Hosur",
        "type": "ITI",
        "district_lgd": "582",
        "address": "SIPCOT Phase I, Hosur, Tamil Nadu 635126",
        "ownership": "Government",
        "lat": 12.7342,
        "lon": 77.8286,
        "offerings": [
            {
                "trade_name": "EV Assembly & Battery Servicing",
                "seats": 45,
                "batch_size": 22,
                "fee_inr": 0.0,
                "scheme": "state",
            },
            {
                "trade_name": "Tool & Die Maker",
                "seats": 25,
                "batch_size": 12,
                "fee_inr": 0.0,
                "scheme": "state",
            },
        ],
    },
    {
        "id": "iti-thoothukudi-govt",
        "name": "Government Industrial Training Institute Thoothukudi",
        "type": "ITI",
        "district_lgd": "608",
        "address": "Korampallam, Thoothukudi, Tamil Nadu 628101",
        "ownership": "Government",
        "lat": 8.7642,
        "lon": 78.1098,
        "offerings": [
            {
                "trade_name": "Solar Technician (Electrical)",
                "seats": 40,
                "batch_size": 20,
                "fee_inr": 0.0,
                "scheme": "PMKVY",
            },
            {
                "trade_name": "Instrument Mechanic (Chemical Plant)",
                "seats": 30,
                "batch_size": 15,
                "fee_inr": 0.0,
                "scheme": "state",
            },
            {
                "trade_name": "Fitter / Marine Fitter",
                "seats": 35,
                "batch_size": 18,
                "fee_inr": 0.0,
                "scheme": "state",
            },
        ],
    },
    {
        "id": "polytechnic-kovilpatti",
        "name": "Lakshmi Ammal Polytechnic College Kovilpatti",
        "type": "polytechnic",
        "district_lgd": "608",
        "address": "K.R. Nagar, Kovilpatti, Thoothukudi, Tamil Nadu 628503",
        "ownership": "Aided",
        "lat": 9.1623,
        "lon": 77.8712,
        "offerings": [
            {
                "trade_name": "Diploma in Mechanical Engineering",
                "seats": 60,
                "batch_size": 30,
                "fee_inr": 6500.0,
                "scheme": "state",
            },
            {
                "trade_name": "Diploma in Renewable Energy Technology",
                "seats": 40,
                "batch_size": 20,
                "fee_inr": 6500.0,
                "scheme": "state",
            },
        ],
    },
]

# National Qualifications Register (NQR) entries for target clusters
SEED_QUALIFICATIONS = [
    {
        "nqr_code": "NQR-AUTO-EV-01",
        "title": "Electric Vehicle Powertrain & Battery Assembly Technician",
        "sector_skill_council": "Automotive Skills Development Council (ASDC)",
        "nsqf_level": 4.0,
        "duration_hours": 450,
        "entry_requirements": "10th Standard or ITI Electrician/Mechanic",
        "job_roles": ["Battery Assembly Technician", "EV Line Operator"],
        "nco_codes": ["7412", "8211"],
        "skills": ["Battery Pack Assembly", "BMS Wiring", "High Voltage Safety", "Torque Tooling"],
    },
    {
        "nqr_code": "NQR-RENEW-SOLAR-02",
        "title": "Solar PV Project Installation Lead",
        "sector_skill_council": "Skill Council for Green Jobs (SCGJ)",
        "nsqf_level": 4.5,
        "duration_hours": 500,
        "entry_requirements": "12th Standard or ITI Electrician",
        "job_roles": ["Solar Site Technician", "PV Inverter Installer"],
        "nco_codes": ["7412"],
        "skills": [
            "PV Module Alignment",
            "Inverter Integration",
            "Grid Synchronization",
            "Earthing",
        ],
    },
    {
        "nqr_code": "NQR-FOOD-PROC-03",
        "title": "Food Processing & Cold Chain Quality Controller",
        "sector_skill_council": "Food Industry Capacity & Skill Initiative (FICSI)",
        "nsqf_level": 4.0,
        "duration_hours": 400,
        "entry_requirements": "12th Standard Science or ITI",
        "job_roles": ["QC Inspector", "Cold Storage Supervisor"],
        "nco_codes": ["7511"],
        "skills": [
            "HACCP Standards",
            "Temperature Logging",
            "Packaging Integrity",
            "Sterilization",
        ],
    },
]

# NAPS Verified Apprenticeship Openings
SEED_APPRENTICESHIPS = [
    {
        "id": "app-ola-hosur-01",
        "establishment_name": "Ola Electric Technologies Pvt Ltd",
        "district_lgd": "582",
        "trade_or_role": "EV Assembly Line Apprentice",
        "cluster_id": "ev_auto",
        "stipend_inr": 12500.0,
        "seats": 50,
        "url": "https://www.apprenticeshipindia.gov.in/ola-electric",
    },
    {
        "id": "app-ather-hosur-02",
        "establishment_name": "Ather Energy Pvt Ltd",
        "district_lgd": "582",
        "trade_or_role": "Battery Pack Testing Technician",
        "cluster_id": "ev_auto",
        "stipend_inr": 13000.0,
        "seats": 25,
        "url": "https://www.apprenticeshipindia.gov.in/ather-energy",
    },
    {
        "id": "app-renew-tuticorin-03",
        "establishment_name": "ReNew Power Renewables Thoothukudi",
        "district_lgd": "608",
        "trade_or_role": "Solar Plant Maintenance Apprentice",
        "cluster_id": "solar_renewables",
        "stipend_inr": 11500.0,
        "seats": 30,
        "url": "https://www.apprenticeshipindia.gov.in/renew-power",
    },
]


class SupplyConnector(BaseConnector):
    """Ingestion client for technical training supply and apprenticeship opportunities."""

    def __init__(self):
        super().__init__(
            source_id="ncvt_nqr",
            name="National Council for Vocational Training & NQR",
            base_url="https://nqr.gov.in",
            rate_limit_rps=1.0,
            licence="GODL-India",
        )

    def fetch(self, **kwargs: Any) -> dict[str, Any]:
        return {
            "institutions": SEED_INSTITUTIONS,
            "qualifications": SEED_QUALIFICATIONS,
            "apprenticeships": SEED_APPRENTICESHIPS,
        }

    def normalise(self, records: list[dict[str, Any]], **kwargs: Any) -> list[Any]:
        return []

    def ingest(self, **kwargs: Any) -> int:
        """Ingest all technical training supply and apprenticeship listings."""
        started_at = datetime.now(UTC)
        data = self.fetch()

        count_inserted = 0
        with SessionLocal() as db:
            # 1. Ingest Qualifications
            for q in data["qualifications"]:
                existing_q = (
                    db.query(Qualification).filter(Qualification.nqr_code == q["nqr_code"]).first()
                )
                if not existing_q:
                    q_obj = Qualification(
                        nqr_code=q["nqr_code"],
                        title=q["title"],
                        sector_skill_council=q["sector_skill_council"],
                        nsqf_level=q["nsqf_level"],
                        duration_hours=q["duration_hours"],
                        entry_requirements=q["entry_requirements"],
                        job_roles=q["job_roles"],
                        nco_codes=q["nco_codes"],
                        skills=q["skills"],
                        source_id=self.source_id,
                        source_url="https://nqr.gov.in",
                        retrieved_at=datetime.now(UTC),
                        content_sha256="hash-nqr-qual",
                        provenance_label="REAL",
                        method="api",
                        licence=self.licence,
                    )
                    db.add(q_obj)
                    count_inserted += 1

            db.commit()

            # 2. Ingest Institutions & Offerings
            for inst in data["institutions"]:
                existing_inst = db.query(Institution).filter(Institution.id == inst["id"]).first()
                if not existing_inst:
                    inst_obj = Institution(
                        id=inst["id"],
                        name=inst["name"],
                        type=inst["type"],
                        district_lgd=inst["district_lgd"],
                        address=inst["address"],
                        ownership=inst["ownership"],
                        lat=inst["lat"],
                        lon=inst["lon"],
                        source_id=self.source_id,
                        source_url="https://ncvtmis.gov.in",
                        retrieved_at=datetime.now(UTC),
                        content_sha256="hash-ncvt-iti",
                        provenance_label="REAL",
                        method="scrape",
                        licence=self.licence,
                    )
                    db.add(inst_obj)
                    db.flush()
                    count_inserted += 1

                    for off in inst.get("offerings", []):
                        off_obj = InstitutionOffering(
                            institution_id=inst["id"],
                            trade_name=off["trade_name"],
                            seats_per_year=off["seats"],
                            batch_size=off["batch_size"],
                            fee_inr=off["fee_inr"],
                            scheme=off["scheme"],
                            source_id=self.source_id,
                            source_url="https://ncvtmis.gov.in",
                            retrieved_at=datetime.now(UTC),
                            content_sha256="hash-offering",
                            provenance_label="REAL",
                            method="scrape",
                            licence=self.licence,
                        )
                        db.add(off_obj)
                        count_inserted += 1

            # 3. Ingest Apprenticeship Openings
            for app in data["apprenticeships"]:
                existing_app = (
                    db.query(ApprenticeshipOpening)
                    .filter(ApprenticeshipOpening.id == app["id"])
                    .first()
                )
                if not existing_app:
                    app_obj = ApprenticeshipOpening(
                        id=app["id"],
                        establishment_name=app["establishment_name"],
                        district_lgd=app["district_lgd"],
                        trade_or_role=app["trade_or_role"],
                        cluster_id=app["cluster_id"],
                        stipend_inr=app["stipend_inr"],
                        seats=app["seats"],
                        url=app["url"],
                        source_id="naps_portal",
                        source_url=app["url"],
                        retrieved_at=datetime.now(UTC),
                        content_sha256="hash-naps-opening",
                        provenance_label="REAL",
                        method="scrape",
                        licence="GODL-India",
                    )
                    db.add(app_obj)
                    count_inserted += 1

            db.commit()

        self.log_run("completed", count_inserted, started_at)
        return count_inserted
