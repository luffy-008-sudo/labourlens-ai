"""Supply-side models: MSME, workforce, indicators, institutions, qualifications, apprenticeships, jobs."""

from __future__ import annotations

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.types import StringList


class MSMECount(Base):
    """Udyam aggregate: MSME count by district × NIC-2 × category."""

    __tablename__ = "msme_counts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    nic2 = Column(String(4), nullable=False)
    category = Column(String(10), nullable=False)  # micro | small | medium
    period = Column(Date, nullable=False)
    count = Column(Integer, nullable=False)

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)

    __table_args__ = (Index("ix_msme_district_nic", "district_lgd", "nic2"),)


class MSMERegistrationMonthly(Base):
    """Monthly new Udyam registrations by district × NIC-2."""

    __tablename__ = "msme_registrations_monthly"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    nic2 = Column(String(4), nullable=False)
    month = Column(Date, nullable=False)
    new_registrations = Column(Integer, nullable=False)

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)


class WorkforceAggregate(Base):
    """eShram: district × occupation × education × gender counts."""

    __tablename__ = "workforce_aggregates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    occupation_code_or_label = Column(String(100), nullable=False)
    education_band = Column(String(50), nullable=True)
    gender = Column(String(10), nullable=True)
    count = Column(Integer, nullable=False)

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)


class DistrictIndicator(Base):
    """District-level development indicators."""

    __tablename__ = "district_indicators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    indicator = Column(String(100), nullable=False)
    value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)

    __table_args__ = (Index("ix_indicators_district", "district_lgd", "indicator"),)


class IndustrialPark(Base):
    """Industrial parks with location and sector focus."""

    __tablename__ = "industrial_parks"

    id = Column(String(64), primary_key=True)
    name = Column(String(300), nullable=False)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    operator = Column(String(200), nullable=True)
    area_acres = Column(Float, nullable=True)
    plots_available = Column(Integer, nullable=True)
    sector_focus = Column(StringList, default=list)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)


class Institution(Base):
    """Training institution: ITI, polytechnic, PMKVY centre, etc."""

    __tablename__ = "institutions"

    id = Column(String(64), primary_key=True)
    name = Column(String(300), nullable=False)
    type = Column(
        String(30), nullable=False
    )  # ITI | PMKVY_TC | polytechnic | college | JSS | other
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    address = Column(Text, nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    ownership = Column(String(30), nullable=True)  # government | private | ppp

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)

    offerings = relationship("InstitutionOffering", back_populates="institution")

    __table_args__ = (
        Index("ix_institutions_district", "district_lgd"),
        Index(
            "ix_institutions_name_trgm",
            "name",
            postgresql_using="gin",
            postgresql_ops={"name": "gin_trgm_ops"},
        ),
    )


class Qualification(Base):
    """NQR qualification with embeddings for semantic matching."""

    __tablename__ = "qualifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nqr_code = Column(String(50), nullable=True, unique=True)
    title = Column(String(300), nullable=False)
    sector_skill_council = Column(String(200), nullable=True)
    nsqf_level = Column(Float, nullable=True)
    duration_hours = Column(Integer, nullable=True)
    entry_requirements = Column(Text, nullable=True)
    job_roles = Column(StringList, default=list)
    nco_codes = Column(StringList, default=list)
    skills = Column(StringList, default=list)
    embedding = Column(Vector(1024), nullable=True)  # bge-m3 dimension

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)


class InstitutionOffering(Base):
    """What a training institution offers (trade/qualification, seats, fees)."""

    __tablename__ = "institution_offerings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    institution_id = Column(String(64), ForeignKey("institutions.id"), nullable=False)
    qualification_id = Column(Integer, ForeignKey("qualifications.id"), nullable=True)
    trade_name = Column(String(200), nullable=True)
    seats_per_year = Column(Integer, nullable=True)
    batch_size = Column(Integer, nullable=True)
    fee_inr = Column(Float, nullable=True)
    scheme = Column(String(30), nullable=True)  # PMKVY | DDU-GKY | state | paid | unknown

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)

    institution = relationship("Institution", back_populates="offerings")


class ApprenticeshipOpening(Base):
    """Apprenticeship openings by location and trade."""

    __tablename__ = "apprenticeship_openings"

    id = Column(String(64), primary_key=True)
    establishment_name = Column(String(300), nullable=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    trade_or_role = Column(String(200), nullable=True)
    cluster_id = Column(String(64), ForeignKey("clusters.id"), nullable=True)
    stipend_inr = Column(Float, nullable=True)
    seats = Column(Integer, nullable=True)
    posted_at = Column(DateTime, nullable=True)
    url = Column(Text, nullable=True)

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)


class JobPosting(Base):
    """Optional demand validation from job portals."""

    __tablename__ = "job_postings"

    id = Column(String(64), primary_key=True)
    title = Column(String(300), nullable=True)
    employer = Column(String(200), nullable=True)
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    cluster_id = Column(String(64), ForeignKey("clusters.id"), nullable=True)
    nco_code = Column(String(10), nullable=True)
    posted_at = Column(DateTime, nullable=True)
    url = Column(Text, nullable=True)

    # Provenance
    source_id = Column(String(50), ForeignKey("sources.id"), nullable=True)
    source_url = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=func.now())
    content_sha256 = Column(String(64), nullable=True)
    provenance_label = Column(String(10), default="REAL")
    method = Column(String(20), nullable=True)
    licence = Column(String(100), nullable=True)
