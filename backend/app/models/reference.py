"""Reference data models: states, districts, places, NIC, NCO, clusters, sources."""

from __future__ import annotations

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class State(Base):
    """Indian state from LGD."""

    __tablename__ = "states"

    state_lgd = Column(String(10), primary_key=True)
    name = Column(String(100), nullable=False)

    districts = relationship("District", back_populates="state")


class District(Base):
    """District with LGD code, focus/comparator flags, and aliases."""

    __tablename__ = "districts"

    district_lgd = Column(String(10), primary_key=True)
    state_lgd = Column(String(10), ForeignKey("states.state_lgd"), nullable=False)
    name = Column(String(100), nullable=False)
    aliases = Column(ARRAY(Text), default=list)
    is_focus = Column(Boolean, default=False)
    is_comparator = Column(Boolean, default=False)
    centroid_lat = Column(Float, nullable=True)
    centroid_lon = Column(Float, nullable=True)
    geojson = Column(JSONB, nullable=True)

    state = relationship("State", back_populates="districts")
    places = relationship("Place", back_populates="district")

    __table_args__ = (Index("ix_districts_aliases", "aliases", postgresql_using="gin"),)


class Place(Base):
    """Gazetteer entry: sub-districts, towns, industrial areas."""

    __tablename__ = "places"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    aliases = Column(ARRAY(Text), default=list)
    place_type = Column(
        String(30), nullable=False
    )  # subdistrict | town | village | industrial_area
    district_lgd = Column(String(10), ForeignKey("districts.district_lgd"), nullable=False)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)

    district = relationship("District", back_populates="places")

    __table_args__ = (
        Index(
            "ix_places_name_trgm",
            "name",
            postgresql_using="gin",
            postgresql_ops={"name": "gin_trgm_ops"},
        ),
    )


class NICCode(Base):
    """NIC-2008 industry classification code."""

    __tablename__ = "nic_codes"

    code = Column(String(10), primary_key=True)
    level = Column(Integer, nullable=False)  # 2, 3, 4, or 5 digit
    description = Column(Text, nullable=False)


class NCOOccupation(Base):
    """NCO-2015 occupation classification."""

    __tablename__ = "nco_occupations"

    code = Column(String(10), primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)


class Cluster(Base):
    """Industry cluster (configured + discovered)."""

    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    nic_codes = Column(ARRAY(Text), default=list)
    keywords = Column(JSONB, default=dict)  # {en: [...], ta: [...], hi: [...]}
    status = Column(String(20), default="active")  # active | proposed | rejected
    created_at = Column(DateTime, default=func.now())


class Source(Base):
    """Data source registry."""

    __tablename__ = "sources"

    id = Column(String(50), primary_key=True)
    name = Column(String(200), nullable=False)
    base_url = Column(Text, nullable=True)
    tier = Column(String(30), nullable=False)
    rate_limit_rps = Column(Float, default=1.0)
    robots_ok = Column(Boolean, default=True)
    licence = Column(String(100), nullable=True)
    status = Column(String(20), default="planned")  # live | planned | blocked
