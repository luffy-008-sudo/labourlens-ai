"""Tests for district and gazetteer resolution."""

from app.reference.gazetteer import resolve_district


def test_exact_district_match():
    """Verify exact district name matching."""
    res = resolve_district("Krishnagiri district industrial policy")
    assert res is not None
    assert res.district_lgd == "582"
    assert res.name == "Krishnagiri"
    assert res.confidence == 1.0


def test_alias_tuticorin_to_thoothukudi():
    """Verify Tuticorin alias maps to Thoothukudi."""
    res = resolve_district("Major green hydrogen plant announced in Tuticorin port area")
    assert res is not None
    assert res.district_lgd == "608"
    assert res.name == "Thoothukudi"
    assert res.confidence >= 0.90


def test_alias_hosur_to_krishnagiri():
    """Verify Hosur maps to Krishnagiri."""
    res = resolve_district("Ola Electric expands FutureFactory in Hosur")
    assert res is not None
    assert res.district_lgd == "582"
    assert res.name == "Krishnagiri"
    assert res.confidence >= 0.90


def test_place_level_resolution():
    """Verify sub-district towns like Pochampalli and Kovilpatti map to correct districts."""
    res_pochampalli = resolve_district("New EV component manufacturing facility at Pochampalli")
    assert res_pochampalli is not None
    assert res_pochampalli.district_lgd == "582"

    res_kovilpatti = resolve_district("Solar energy farm commissioned near Kovilpatti")
    assert res_kovilpatti is not None
    assert res_kovilpatti.district_lgd == "608"


def test_chennai_comparator():
    """Verify Chennai and Madras resolve to comparator district 603."""
    res = resolve_district("Software technology park in OMR Madras")
    assert res is not None
    assert res.district_lgd == "603"
    assert res.name == "Chennai"


def test_irrelevant_location():
    """Verify non-TN location returns None."""
    res = resolve_district("New IT park established in Noida Uttar Pradesh")
    assert res is None
