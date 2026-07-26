// GENERATED FILE -- do not hand-edit. Regenerate with:
//   pnpm exec tsx scripts/generate-scraped-vectors.ts   (run from web/)
//
// doc 07 §7.3's scraped-values golden suite: real formatted strings scraped
// from captured legacy pages (web/parity/snapshots/pages/**), paired with
// their float32 raw inputs from the production dump
// (web/parity/dumps/{trees,sites}.csv). See
// web/scripts/generate-scraped-vectors.ts's header for the full field ->
// formatter mapping, source files, and why Elevation is excluded (no legacy
// Browse/Map page ever renders it -- see that file's header).
//
// Generated: 2026-07-18. 202 vectors.
import { describe, expect, it } from "vitest";
import {
  distanceSubunit,
  formatDistance,
  formatRuckerIndex,
  formatVolume,
  Units,
} from "./format";
import { formatLatitude, formatLongitude } from "../geo/coordinates";

describe("formatDistance - scraped legacy values (doc 07 §7.3)", () => {
  it("10.916666984558105 -> \"10.9'\" (Trees/168925/Details.extracted.json details.Height)", () => {
    expect(formatDistance(10.916666984558105, Units.Feet)).toBe("10.9'");
  });
  it("26.700000762939453 -> \"26.7'\" (Trees/226091/Details.extracted.json details.Height)", () => {
    expect(formatDistance(26.700000762939453, Units.Feet)).toBe("26.7'");
  });
  it("35.70000076293945 -> \"35.7'\" (Trees/272856/Details.extracted.json details.Height)", () => {
    expect(formatDistance(35.70000076293945, Units.Feet)).toBe("35.7'");
  });
  it("43.900001525878906 -> \"43.9'\" (Trees/271893/Details.extracted.json details.Height)", () => {
    expect(formatDistance(43.900001525878906, Units.Feet)).toBe("43.9'");
  });
  it("57.79999923706055 -> \"57.8'\" (Trees/138816/Details.extracted.json details.Height)", () => {
    expect(formatDistance(57.79999923706055, Units.Feet)).toBe("57.8'");
  });
  it("62.900001525878906 -> \"62.9'\" (Trees/39760/Details.extracted.json details.Height)", () => {
    expect(formatDistance(62.900001525878906, Units.Feet)).toBe("62.9'");
  });
  it("72.30000305175781 -> \"72.3'\" (Trees/167742/Details.extracted.json details.Height)", () => {
    expect(formatDistance(72.30000305175781, Units.Feet)).toBe("72.3'");
  });
  it("79.30000305175781 -> \"79.3'\" (Trees/169764/Details.extracted.json details.Height)", () => {
    expect(formatDistance(79.30000305175781, Units.Feet)).toBe("79.3'");
  });
  it("81.80000305175781 -> \"81.8'\" (Trees/313573/Details.extracted.json details.Height)", () => {
    expect(formatDistance(81.80000305175781, Units.Feet)).toBe("81.8'");
  });
  it("85.9000015258789 -> \"85.9'\" (Trees/240480/Details.extracted.json details.Height)", () => {
    expect(formatDistance(85.9000015258789, Units.Feet)).toBe("85.9'");
  });
  it("89.5 -> \"89.5'\" (Trees/33237/Details.extracted.json details.Height)", () => {
    expect(formatDistance(89.5, Units.Feet)).toBe("89.5'");
  });
  it("93.4000015258789 -> \"93.4'\" (Trees/255910/Details.extracted.json details.Height)", () => {
    expect(formatDistance(93.4000015258789, Units.Feet)).toBe("93.4'");
  });
  it("98.30000305175781 -> \"98.3'\" (Trees/228973/Details.extracted.json details.Height)", () => {
    expect(formatDistance(98.30000305175781, Units.Feet)).toBe("98.3'");
  });
  it("100.69999694824219 -> \"100.7'\" (Trees/140086/Details.extracted.json details.Height)", () => {
    expect(formatDistance(100.69999694824219, Units.Feet)).toBe("100.7'");
  });
  it("102.5 -> \"102.5'\" (Trees/2368/Details.extracted.json details.Height)", () => {
    expect(formatDistance(102.5, Units.Feet)).toBe("102.5'");
  });
  it("105 -> \"105.0'\" (Trees/39753/Details.extracted.json details[\"Crown spread\"])", () => {
    expect(formatDistance(105, Units.Feet)).toBe("105.0'");
  });
  it("106 -> \"106.0'\" (Trees/2378/Details.extracted.json details.Height)", () => {
    expect(formatDistance(106, Units.Feet)).toBe("106.0'");
  });
  it("107.9000015258789 -> \"107.9'\" (Trees/169754/Details.extracted.json details.Height)", () => {
    expect(formatDistance(107.9000015258789, Units.Feet)).toBe("107.9'");
  });
  it("110.5 -> \"110.5'\" (Trees/2380/Details.extracted.json details.Height)", () => {
    expect(formatDistance(110.5, Units.Feet)).toBe("110.5'");
  });
  it("113.5999984741211 -> \"113.6'\" (Trees/214537/Details.extracted.json details.Height)", () => {
    expect(formatDistance(113.5999984741211, Units.Feet)).toBe("113.6'");
  });
  it("116 -> \"116.0'\" (Trees/2382/Details.extracted.json details.Height)", () => {
    expect(formatDistance(116, Units.Feet)).toBe("116.0'");
  });
  it("117.4000015258789 -> \"117.4'\" (Trees/313153/Details.extracted.json details.Height)", () => {
    expect(formatDistance(117.4000015258789, Units.Feet)).toBe("117.4'");
  });
  it("121 -> \"121.0'\" (Trees/297486/Details.extracted.json details.Height)", () => {
    expect(formatDistance(121, Units.Feet)).toBe("121.0'");
  });
  it("123.80000305175781 -> \"123.8'\" (Trees/127942/Details.extracted.json details.Height)", () => {
    expect(formatDistance(123.80000305175781, Units.Feet)).toBe("123.8'");
  });
  it("126.19999694824219 -> \"126.2'\" (Trees/252708/Details.extracted.json details.Height)", () => {
    expect(formatDistance(126.19999694824219, Units.Feet)).toBe("126.2'");
  });
  it("128 -> \"128.0'\" (Trees/281808/Details.extracted.json details.Height)", () => {
    expect(formatDistance(128, Units.Feet)).toBe("128.0'");
  });
  it("131.10000610351562 -> \"131.1'\" (Trees/297797/Details.extracted.json details.Height)", () => {
    expect(formatDistance(131.10000610351562, Units.Feet)).toBe("131.1'");
  });
  it("134.5 -> \"134.5'\" (Trees/255910/Details.extracted.json details[\"Crown spread\"])", () => {
    expect(formatDistance(134.5, Units.Feet)).toBe("134.5'");
  });
  it("138.1999969482422 -> \"138.2'\" (Trees/39879/Details.extracted.json details.Height)", () => {
    expect(formatDistance(138.1999969482422, Units.Feet)).toBe("138.2'");
  });
  it("143.39999389648438 -> \"143.4'\" (Trees/256795/Details.extracted.json details[\"Crown spread\"])", () => {
    expect(formatDistance(143.39999389648438, Units.Feet)).toBe("143.4'");
  });
  it("151 -> \"151.0'\" (Trees/242620/Details.extracted.json details.Height)", () => {
    expect(formatDistance(151, Units.Feet)).toBe("151.0'");
  });
  it("155.60000610351562 -> \"155.6'\" (Trees/249357/Details.extracted.json details.Height)", () => {
    expect(formatDistance(155.60000610351562, Units.Feet)).toBe("155.6'");
  });
  it("162 -> \"162.0'\" (Trees/239640/Details.extracted.json details.Height)", () => {
    expect(formatDistance(162, Units.Feet)).toBe("162.0'");
  });
  it("216.8000030517578 -> \"216.8'\" (Trees/268816/Details.extracted.json details.Height)", () => {
    expect(formatDistance(216.8000030517578, Units.Feet)).toBe("216.8'");
  });
  it("242.10000610351562 -> \"242.1'\" (Trees/236003/Details.extracted.json details.Height)", () => {
    expect(formatDistance(242.10000610351562, Units.Feet)).toBe("242.1'");
  });
  it("250 -> \"250.0'\" (Trees/216289/Details.extracted.json details.Height)", () => {
    expect(formatDistance(250, Units.Feet)).toBe("250.0'");
  });
  it("252.60000610351562 -> \"252.6'\" (Trees/296624/Details.extracted.json details.Height)", () => {
    expect(formatDistance(252.60000610351562, Units.Feet)).toBe("252.6'");
  });
  it("255 -> \"255.0'\" (Trees/216285/Details.extracted.json details.Height)", () => {
    expect(formatDistance(255, Units.Feet)).toBe("255.0'");
  });
  it("256.20001220703125 -> \"256.2'\" (Trees/296641/Details.extracted.json details.Height)", () => {
    expect(formatDistance(256.20001220703125, Units.Feet)).toBe("256.2'");
  });
  it("258.1000061035156 -> \"258.1'\" (Trees/296876/Details.extracted.json details.Height)", () => {
    expect(formatDistance(258.1000061035156, Units.Feet)).toBe("258.1'");
  });
  it("260.3999938964844 -> \"260.4'\" (Trees/280375/Details.extracted.json details.Height)", () => {
    expect(formatDistance(260.3999938964844, Units.Feet)).toBe("260.4'");
  });
  it("264.5 -> \"264.5'\" (Trees/216275/Details.extracted.json details.Height)", () => {
    expect(formatDistance(264.5, Units.Feet)).toBe("264.5'");
  });
  it("268.70001220703125 -> \"268.7'\" (Trees/269562/Details.extracted.json details.Height)", () => {
    expect(formatDistance(268.70001220703125, Units.Feet)).toBe("268.7'");
  });
  it("271 -> \"271.0'\" (Trees/296618/Details.extracted.json details.Height)", () => {
    expect(formatDistance(271, Units.Feet)).toBe("271.0'");
  });
  it("276.29998779296875 -> \"276.3'\" (Trees/296625/Details.extracted.json details.Height)", () => {
    expect(formatDistance(276.29998779296875, Units.Feet)).toBe("276.3'");
  });
  it("298.6000061035156 -> \"298.6'\" (Trees/216273/Details.extracted.json details.Height)", () => {
    expect(formatDistance(298.6000061035156, Units.Feet)).toBe("298.6'");
  });
  it("308 -> \"308.0'\" (Trees/269541/Details.extracted.json details.Height)", () => {
    expect(formatDistance(308, Units.Feet)).toBe("308.0'");
  });
  it("317.5 -> \"317.5'\" (Trees/269536/Details.extracted.json details.Height)", () => {
    expect(formatDistance(317.5, Units.Feet)).toBe("317.5'");
  });
  it("330.3800048828125 -> \"330.4'\" (Trees/269028/Details.extracted.json details.Height)", () => {
    expect(formatDistance(330.3800048828125, Units.Feet)).toBe("330.4'");
  });
  it("351.79998779296875 -> \"351.8'\" (Trees/269154/Details.extracted.json details.Height)", () => {
    expect(formatDistance(351.79998779296875, Units.Feet)).toBe("351.8'");
  });
});

describe("distanceSubunit - scraped legacy values (doc 07 §7.3)", () => {
  it("0.35014086961746216 -> \"4''\" (Trees/46449/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(0.35014086961746216, Units.Feet)).toBe("4''");
  });
  it("0.9177934527397156 -> \"11''\" (Trees/23794/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(0.9177934527397156, Units.Feet)).toBe("11''");
  });
  it("1.4960564374923706 -> \"18''\" (Trees/315506/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(1.4960564374923706, Units.Feet)).toBe("18''");
  });
  it("1.7507044076919556 -> \"21''\" (Trees/242668/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(1.7507044076919556, Units.Feet)).toBe("21''");
  });
  it("1.9629108905792236 -> \"24''\" (Trees/2374/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(1.9629108905792236, Units.Feet)).toBe("24''");
  });
  it("2.196338176727295 -> \"26''\" (Trees/280973/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(2.196338176727295, Units.Feet)).toBe("26''");
  });
  it("2.3607983589172363 -> \"28''\" (Trees/2382/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(2.3607983589172363, Units.Feet)).toBe("28''");
  });
  it("2.514648199081421 -> \"30''\" (Trees/145689/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(2.514648199081421, Units.Feet)).toBe("30''");
  });
  it("2.6791083812713623 -> \"32''\" (Trees/146545/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(2.6791083812713623, Units.Feet)).toBe("32''");
  });
  it("2.8647890090942383 -> \"34''\" (Trees/230029/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(2.8647890090942383, Units.Feet)).toBe("34''");
  });
  it("2.9708921909332275 -> \"36''\" (Trees/2384/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(2.9708921909332275, Units.Feet)).toBe("36''");
  });
  it("3.130047082901001 -> \"38''\" (Trees/2376/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(3.130047082901001, Units.Feet)).toBe("38''");
  });
  it("3.395305633544922 -> \"41''\" (Trees/228980/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(3.395305633544922, Units.Feet)).toBe("41''");
  });
  it("3.872770309448242 -> \"46''\" (Trees/233876/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(3.872770309448242, Units.Feet)).toBe("46''");
  });
  it("4.111502647399902 -> \"49''\" (Trees/269572/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(4.111502647399902, Units.Feet)).toBe("49''");
  });
  it("4.456338405609131 -> \"53''\" (Trees/142815/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(4.456338405609131, Units.Feet)).toBe("53''");
  });
  it("4.900000095367432 -> \"59''\" (Trees/315503/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(4.900000095367432, Units.Feet)).toBe("59''");
  });
  it("5.225586891174316 -> \"63''\" (Trees/171558/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(5.225586891174316, Units.Feet)).toBe("63''");
  });
  it("5.5 -> \"66''\" (Trees/242668/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(5.5, Units.Feet)).toBe("66''");
  });
  it("5.8569016456604 -> \"70''\" (Trees/296640/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(5.8569016456604, Units.Feet)).toBe("70''");
  });
  it("6.300000190734863 -> \"76''\" (Trees/297834/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(6.300000190734863, Units.Feet)).toBe("76''");
  });
  it("6.666666507720947 -> \"80''\" (Trees/2372/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(6.666666507720947, Units.Feet)).toBe("80''");
  });
  it("7 -> \"84''\" (Trees/165807/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(7, Units.Feet)).toBe("84''");
  });
  it("7.305212020874023 -> \"88''\" (Trees/296622/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(7.305212020874023, Units.Feet)).toBe("88''");
  });
  it("7.700000286102295 -> \"92''\" (Trees/167742/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(7.700000286102295, Units.Feet)).toBe("92''");
  });
  it("8.208333015441895 -> \"99''\" (Trees/162235/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(8.208333015441895, Units.Feet)).toBe("99''");
  });
  it("8.416666984558105 -> \"101''\" (Trees/146545/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(8.416666984558105, Units.Feet)).toBe("101''");
  });
  it("8.753521919250488 -> \"105''\" (Trees/239659/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(8.753521919250488, Units.Feet)).toBe("105''");
  });
  it("9.000211715698242 -> \"108''\" (Trees/239718/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(9.000211715698242, Units.Feet)).toBe("108''");
  });
  it("9.103662490844727 -> \"109''\" (Trees/274353/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(9.103662490844727, Units.Feet)).toBe("109''");
  });
  it("9.40000057220459 -> \"113''\" (Trees/139026/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(9.40000057220459, Units.Feet)).toBe("113''");
  });
  it("9.75 -> \"117''\" (Trees/2378/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(9.75, Units.Feet)).toBe("117''");
  });
  it("10.159390449523926 -> \"122''\" (Trees/236003/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(10.159390449523926, Units.Feet)).toBe("122''");
  });
  it("10.472395896911621 -> \"126''\" (Trees/39759/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(10.472395896911621, Units.Feet)).toBe("126''");
  });
  it("10.833333015441895 -> \"130''\" (Trees/168417/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(10.833333015441895, Units.Feet)).toBe("130''");
  });
  it("12.000283241271973 -> \"144''\" (Trees/239722/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(12.000283241271973, Units.Feet)).toBe("144''");
  });
  it("12.699999809265137 -> \"152''\" (Trees/291281/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(12.699999809265137, Units.Feet)).toBe("152''");
  });
  it("13.36901569366455 -> \"160''\" (Trees/269584/Details.extracted.json details.Diameter)", () => {
    expect(distanceSubunit(13.36901569366455, Units.Feet)).toBe("160''");
  });
  it("14.166666984558105 -> \"170''\" (Trees/2373/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(14.166666984558105, Units.Feet)).toBe("170''");
  });
  it("16.350000381469727 -> \"196''\" (Trees/274399/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(16.350000381469727, Units.Feet)).toBe("196''");
  });
  it("17.83333396911621 -> \"214''\" (Trees/251572/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(17.83333396911621, Units.Feet)).toBe("214''");
  });
  it("19.16666603088379 -> \"230''\" (Trees/269563/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(19.16666603088379, Units.Feet)).toBe("230''");
  });
  it("21.991666793823242 -> \"264''\" (Trees/268754/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(21.991666793823242, Units.Feet)).toBe("264''");
  });
  it("25.758333206176758 -> \"309''\" (Trees/269154/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(25.758333206176758, Units.Feet)).toBe("309''");
  });
  it("27.41666603088379 -> \"329''\" (Trees/312034/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(27.41666603088379, Units.Feet)).toBe("329''");
  });
  it("28.59166717529297 -> \"343''\" (Trees/268753/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(28.59166717529297, Units.Feet)).toBe("343''");
  });
  it("29.84166717529297 -> \"358''\" (Trees/269074/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(29.84166717529297, Units.Feet)).toBe("358''");
  });
  it("31.91666603088379 -> \"383''\" (Trees/236003/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(31.91666603088379, Units.Feet)).toBe("383''");
  });
  it("34.58333206176758 -> \"415''\" (Trees/239714/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(34.58333206176758, Units.Feet)).toBe("415''");
  });
  it("42 -> \"504''\" (Trees/269584/Details.extracted.json details.Girth)", () => {
    expect(distanceSubunit(42, Units.Feet)).toBe("504''");
  });
});

describe("formatVolume - scraped legacy values (doc 07 §7.3)", () => {
  it("0.571313202381134 -> \"0.6 ft³\" (Trees/46449/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(0.571313202381134, Units.Feet)).toBe("0.6 ft³");
  });
  it("8.110588073730469 -> \"8.1 ft³\" (Trees/138816/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(8.110588073730469, Units.Feet)).toBe("8.1 ft³");
  });
  it("43.476253509521484 -> \"43.5 ft³\" (Trees/228973/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(43.476253509521484, Units.Feet)).toBe("43.5 ft³");
  });
  it("79.6411361694336 -> \"79.6 ft³\" (Trees/272780/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(79.6411361694336, Units.Feet)).toBe("79.6 ft³");
  });
  it("100.19025421142578 -> \"100.2 ft³\" (Trees/260718/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(100.19025421142578, Units.Feet)).toBe("100.2 ft³");
  });
  it("121.4293212890625 -> \"121.4 ft³\" (Trees/2372/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(121.4293212890625, Units.Feet)).toBe("121.4 ft³");
  });
  it("150.57176208496094 -> \"150.6 ft³\" (Trees/187639/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(150.57176208496094, Units.Feet)).toBe("150.6 ft³");
  });
  it("168.3063507080078 -> \"168.3 ft³\" (Trees/320179/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(168.3063507080078, Units.Feet)).toBe("168.3 ft³");
  });
  it("191.8557891845703 -> \"191.9 ft³\" (Trees/2367/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(191.8557891845703, Units.Feet)).toBe("191.9 ft³");
  });
  it("208.16554260253906 -> \"208.2 ft³\" (Trees/2369/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(208.16554260253906, Units.Feet)).toBe("208.2 ft³");
  });
  it("229.24981689453125 -> \"229.2 ft³\" (Trees/146545/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(229.24981689453125, Units.Feet)).toBe("229.2 ft³");
  });
  it("247.99472045898438 -> \"248.0 ft³\" (Trees/233560/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(247.99472045898438, Units.Feet)).toBe("248.0 ft³");
  });
  it("272.392333984375 -> \"272.4 ft³\" (Trees/2376/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(272.392333984375, Units.Feet)).toBe("272.4 ft³");
  });
  it("317.34698486328125 -> \"317.3 ft³\" (Trees/230774/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(317.34698486328125, Units.Feet)).toBe("317.3 ft³");
  });
  it("354.45281982421875 -> \"354.5 ft³\" (Trees/119570/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(354.45281982421875, Units.Feet)).toBe("354.5 ft³");
  });
  it("422.5172119140625 -> \"422.5 ft³\" (Trees/323598/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(422.5172119140625, Units.Feet)).toBe("422.5 ft³");
  });
  it("521.10302734375 -> \"521.1 ft³\" (Trees/291281/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(521.10302734375, Units.Feet)).toBe("521.1 ft³");
  });
  it("911.08251953125 -> \"911.1 ft³\" (Trees/251572/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(911.08251953125, Units.Feet)).toBe("911.1 ft³");
  });
  it("1359.231689453125 -> \"1359.2 ft³\" (Trees/322745/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(1359.231689453125, Units.Feet)).toBe("1359.2 ft³");
  });
  it("1814.079833984375 -> \"1814.1 ft³\" (Trees/296639/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(1814.079833984375, Units.Feet)).toBe("1814.1 ft³");
  });
  it("1991.4267578125 -> \"1991.4 ft³\" (Trees/269571/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(1991.4267578125, Units.Feet)).toBe("1991.4 ft³");
  });
  it("2283.76220703125 -> \"2283.8 ft³\" (Trees/296640/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(2283.76220703125, Units.Feet)).toBe("2283.8 ft³");
  });
  it("2843.267333984375 -> \"2843.3 ft³\" (Trees/312034/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(2843.267333984375, Units.Feet)).toBe("2843.3 ft³");
  });
  it("3492.989501953125 -> \"3493.0 ft³\" (Trees/216273/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(3492.989501953125, Units.Feet)).toBe("3493.0 ft³");
  });
  it("4353.974609375 -> \"4354.0 ft³\" (Trees/239649/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(4353.974609375, Units.Feet)).toBe("4354.0 ft³");
  });
  it("5220.4423828125 -> \"5220.4 ft³\" (Trees/269074/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(5220.4423828125, Units.Feet)).toBe("5220.4 ft³");
  });
  it("6191.56201171875 -> \"6191.6 ft³\" (Trees/269154/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(6191.56201171875, Units.Feet)).toBe("6191.6 ft³");
  });
  it("8047.365234375 -> \"8047.4 ft³\" (Trees/269538/Details.extracted.json details[\"Conical volume\"])", () => {
    expect(formatVolume(8047.365234375, Units.Feet)).toBe("8047.4 ft³");
  });
});

describe("formatRuckerIndex - scraped legacy values (doc 07 §7.3)", () => {
  it("1.3199999332427979 -> \"1.32\" (Locations--full.extracted.json site 42355 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(1.3199999332427979, Units.Feet)).toBe("1.32");
  });
  it("6.371000289916992 -> \"6.37\" (Locations--full.extracted.json site 42391 column ComputedRGI10)", () => {
    expect(formatRuckerIndex(6.371000289916992, Units.Feet)).toBe("6.37");
  });
  it("7.0920000076293945 -> \"7.09\" (Locations--full.extracted.json site 42392 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(7.0920000076293945, Units.Feet)).toBe("7.09");
  });
  it("7.61400032043457 -> \"7.61\" (Locations--full.extracted.json site 42393 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(7.61400032043457, Units.Feet)).toBe("7.61");
  });
  it("7.999000072479248 -> \"8.00\" (Locations--full.extracted.json site 42389 column ComputedRGI10)", () => {
    expect(formatRuckerIndex(7.999000072479248, Units.Feet)).toBe("8.00");
  });
  it("8.355999946594238 -> \"8.36\" (Locations--full.extracted.json site 42391 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(8.355999946594238, Units.Feet)).toBe("8.36");
  });
  it("8.670000076293945 -> \"8.67\" (Locations--full.extracted.json site 42372 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(8.670000076293945, Units.Feet)).toBe("8.67");
  });
  it("9.010000228881836 -> \"9.01\" (Locations--full.extracted.json site 42388 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(9.010000228881836, Units.Feet)).toBe("9.01");
  });
  it("9.550000190734863 -> \"9.55\" (Locations--full.extracted.json site 42394 column ComputedRGI10)", () => {
    expect(formatRuckerIndex(9.550000190734863, Units.Feet)).toBe("9.55");
  });
  it("9.842000007629395 -> \"9.84\" (Locations--full.extracted.json site 42386 column ComputedRGI10)", () => {
    expect(formatRuckerIndex(9.842000007629395, Units.Feet)).toBe("9.84");
  });
  it("10.167333602905273 -> \"10.17\" (Locations--full.extracted.json site 42368 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(10.167333602905273, Units.Feet)).toBe("10.17");
  });
  it("10.883999824523926 -> \"10.88\" (Locations--full.extracted.json site 42387 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(10.883999824523926, Units.Feet)).toBe("10.88");
  });
  it("11.628999710083008 -> \"11.63\" (Locations--full.extracted.json site 42376 column ComputedRGI10)", () => {
    expect(formatRuckerIndex(11.628999710083008, Units.Feet)).toBe("11.63");
  });
  it("12.835000038146973 -> \"12.84\" (Locations--full.extracted.json site 41233 column ComputedRGI10)", () => {
    expect(formatRuckerIndex(12.835000038146973, Units.Feet)).toBe("12.84");
  });
  it("16.003000259399414 -> \"16.00\" (Locations--full.extracted.json site 40335 column ComputedRGI10)", () => {
    expect(formatRuckerIndex(16.003000259399414, Units.Feet)).toBe("16.00");
  });
  it("19.420000076293945 -> \"19.42\" (Locations--full.extracted.json site 42364 column ComputedRGI5)", () => {
    expect(formatRuckerIndex(19.420000076293945, Units.Feet)).toBe("19.42");
  });
  it("117.13999938964844 -> \"117.14\" (Locations--full.extracted.json site 42391 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(117.13999938964844, Units.Feet)).toBe("117.14");
  });
  it("125.69999694824219 -> \"125.70\" (Locations--full.extracted.json site 42373 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(125.69999694824219, Units.Feet)).toBe("125.70");
  });
  it("127.5999984741211 -> \"127.60\" (Locations--full.extracted.json site 42389 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(127.5999984741211, Units.Feet)).toBe("127.60");
  });
  it("132.05999755859375 -> \"132.06\" (Locations--full.extracted.json site 42377 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(132.05999755859375, Units.Feet)).toBe("132.06");
  });
  it("133.90000915527344 -> \"133.90\" (Locations--full.extracted.json site 42389 column ComputedRHI5)", () => {
    expect(formatRuckerIndex(133.90000915527344, Units.Feet)).toBe("133.90");
  });
  it("135.6199951171875 -> \"135.62\" (Locations--full.extracted.json site 42380 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(135.6199951171875, Units.Feet)).toBe("135.62");
  });
  it("137.30999755859375 -> \"137.31\" (Locations--full.extracted.json site 42387 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(137.30999755859375, Units.Feet)).toBe("137.31");
  });
  it("138.9600067138672 -> \"138.96\" (Locations--full.extracted.json site 42380 column ComputedRHI5)", () => {
    expect(formatRuckerIndex(138.9600067138672, Units.Feet)).toBe("138.96");
  });
  it("140.9300079345703 -> \"140.93\" (Locations--full.extracted.json site 42356 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(140.9300079345703, Units.Feet)).toBe("140.93");
  });
  it("143.260009765625 -> \"143.26\" (Locations--full.extracted.json site 39152 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(143.260009765625, Units.Feet)).toBe("143.26");
  });
  it("145.6699981689453 -> \"145.67\" (Locations--full.extracted.json site 42360 column ComputedRHI10)", () => {
    expect(formatRuckerIndex(145.6699981689453, Units.Feet)).toBe("145.67");
  });
  it("147.6199951171875 -> \"147.62\" (Locations--full.extracted.json site 42385 column ComputedRHI5)", () => {
    expect(formatRuckerIndex(147.6199951171875, Units.Feet)).toBe("147.62");
  });
  it("151.9199981689453 -> \"151.92\" (Locations--full.extracted.json site 42355 column ComputedRHI5)", () => {
    expect(formatRuckerIndex(151.9199981689453, Units.Feet)).toBe("151.92");
  });
  it("158.05999755859375 -> \"158.06\" (Locations--full.extracted.json site 42364 column ComputedRHI5)", () => {
    expect(formatRuckerIndex(158.05999755859375, Units.Feet)).toBe("158.06");
  });
});

describe("formatLatitude - scraped legacy values (doc 07 §7.3, DegreesDecimalMinutes)", () => {
  it("29.8193302154541 -> \"29 49.160\" (Trees/239648/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(29.8193302154541, "DegreesDecimalMinutes")).toBe("29 49.160");
  });
  it("34.36526870727539 -> \"34 21.916\" (Trees/241389/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(34.36526870727539, "DegreesDecimalMinutes")).toBe("34 21.916");
  });
  it("35.11989974975586 -> \"35 07.194\" (Trees/315503/Details.extracted.json location.coordinatesValue (specified, lat))", () => {
    expect(formatLatitude(35.11989974975586, "DegreesDecimalMinutes")).toBe("35 07.194");
  });
  it("35.29526901245117 -> \"35 17.716\" (Trees/252103/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(35.29526901245117, "DegreesDecimalMinutes")).toBe("35 17.716");
  });
  it("35.447471618652344 -> \"35 26.848\" (Trees/230029/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(35.447471618652344, "DegreesDecimalMinutes")).toBe("35 26.848");
  });
  it("36.121219635009766 -> \"36 07.273\" (Trees/323809/Details.extracted.json location.coordinatesValue (specified, lat))", () => {
    expect(formatLatitude(36.121219635009766, "DegreesDecimalMinutes")).toBe("36 07.273");
  });
  it("37.16748046875 -> \"37 10.049\" (Trees/269028/Details.extracted.json location.coordinatesValue (specified, lat))", () => {
    expect(formatLatitude(37.16748046875, "DegreesDecimalMinutes")).toBe("37 10.049");
  });
  it("38.28160095214844 -> \"38 16.896\" (Trees/268753/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(38.28160095214844, "DegreesDecimalMinutes")).toBe("38 16.896");
  });
  it("39.07052993774414 -> \"39 04.232\" (Trees/269073/Details.extracted.json location.coordinatesValue (specified, lat))", () => {
    expect(formatLatitude(39.07052993774414, "DegreesDecimalMinutes")).toBe("39 04.232");
  });
  it("39.26953125 -> \"39 16.172\" (Trees/271889/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(39.26953125, "DegreesDecimalMinutes")).toBe("39 16.172");
  });
  it("39.640499114990234 -> \"39 38.430\" (Trees/230774/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(39.640499114990234, "DegreesDecimalMinutes")).toBe("39 38.430");
  });
  it("40.169498443603516 -> \"40 10.170\" (Trees/268683/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(40.169498443603516, "DegreesDecimalMinutes")).toBe("40 10.170");
  });
  it("40.91053009033203 -> \"40 54.632\" (Trees/255910/Details.extracted.json location.coordinatesValue (specified, lat))", () => {
    expect(formatLatitude(40.91053009033203, "DegreesDecimalMinutes")).toBe("40 54.632");
  });
  it("41.31657028198242 -> \"41 18.994\" (Trees/139561/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(41.31657028198242, "DegreesDecimalMinutes")).toBe("41 18.994");
  });
  it("41.541969299316406 -> \"41 32.518\" (Trees/119209/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(41.541969299316406, "DegreesDecimalMinutes")).toBe("41 32.518");
  });
  it("42.051998138427734 -> \"42 03.120\" (Trees/140086/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(42.051998138427734, "DegreesDecimalMinutes")).toBe("42 03.120");
  });
  it("42.43561935424805 -> \"42 26.137\" (Trees/257493/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(42.43561935424805, "DegreesDecimalMinutes")).toBe("42 26.137");
  });
  it("43.18939971923828 -> \"43 11.364\" (Trees/323089/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(43.18939971923828, "DegreesDecimalMinutes")).toBe("43 11.364");
  });
  it("44.438201904296875 -> \"44 26.292\" (Trees/257551/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(44.438201904296875, "DegreesDecimalMinutes")).toBe("44 26.292");
  });
  it("46.143070220947266 -> \"46 08.584\" (Trees/296624/Details.extracted.json location.coordinatesValue (specified, lat))", () => {
    expect(formatLatitude(46.143070220947266, "DegreesDecimalMinutes")).toBe("46 08.584");
  });
  it("46.17947006225586 -> \"46 10.768\" (Trees/296641/Details.extracted.json location.coordinatesValue (specified, lat))", () => {
    expect(formatLatitude(46.17947006225586, "DegreesDecimalMinutes")).toBe("46 10.768");
  });
  it("47.55046844482422 -> \"47 33.028\" (Trees/239714/Details.extracted.json location.coordinatesValue (calculated, lat))", () => {
    expect(formatLatitude(47.55046844482422, "DegreesDecimalMinutes")).toBe("47 33.028");
  });
});

describe("formatLongitude - scraped legacy values (doc 07 §7.3, DegreesDecimalMinutes)", () => {
  it("-124.25721740722656 -> \"-124 15.433\" (Trees/296874/Details.extracted.json location.coordinatesValue (specified, long))", () => {
    expect(formatLongitude(-124.25721740722656, "DegreesDecimalMinutes")).toBe("-124 15.433");
  });
  it("-123.93315124511719 -> \"-123 55.989\" (Trees/216281/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-123.93315124511719, "DegreesDecimalMinutes")).toBe("-123 55.989");
  });
  it("-123.6481704711914 -> \"-123 38.890\" (Trees/239725/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-123.6481704711914, "DegreesDecimalMinutes")).toBe("-123 38.890");
  });
  it("-122.27503204345703 -> \"-122 16.502\" (Trees/296619/Details.extracted.json location.coordinatesValue (specified, long))", () => {
    expect(formatLongitude(-122.27503204345703, "DegreesDecimalMinutes")).toBe("-122 16.502");
  });
  it("-122.22712707519531 -> \"-122 13.628\" (Trees/269027/Details.extracted.json location.coordinatesValue (specified, long))", () => {
    expect(formatLongitude(-122.22712707519531, "DegreesDecimalMinutes")).toBe("-122 13.628");
  });
  it("-121.56661987304688 -> \"-121 33.997\" (Trees/239658/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-121.56661987304688, "DegreesDecimalMinutes")).toBe("-121 33.997");
  });
  it("-120.30963134765625 -> \"-120 18.578\" (Trees/268753/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-120.30963134765625, "DegreesDecimalMinutes")).toBe("-120 18.578");
  });
  it("-111.5699462890625 -> \"-111 34.197\" (Trees/46449/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-111.5699462890625, "DegreesDecimalMinutes")).toBe("-111 34.197");
  });
  it("-90.05792236328125 -> \"-090 03.475\" (Trees/228973/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-90.05792236328125, "DegreesDecimalMinutes")).toBe("-090 03.475");
  });
  it("-87.20390319824219 -> \"-087 12.234\" (Trees/233876/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-87.20390319824219, "DegreesDecimalMinutes")).toBe("-087 12.234");
  });
  it("-85.64777374267578 -> \"-085 38.866\" (Trees/320601/Details.extracted.json location.coordinatesValue (specified, long))", () => {
    expect(formatLongitude(-85.64777374267578, "DegreesDecimalMinutes")).toBe("-085 38.866");
  });
  it("-84.43473052978516 -> \"-084 26.084\" (Trees/323809/Details.extracted.json location.coordinatesValue (specified, long))", () => {
    expect(formatLongitude(-84.43473052978516, "DegreesDecimalMinutes")).toBe("-084 26.084");
  });
  it("-83.39787292480469 -> \"-083 23.872\" (Trees/168925/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-83.39787292480469, "DegreesDecimalMinutes")).toBe("-083 23.872");
  });
  it("-82.84705352783203 -> \"-082 50.823\" (Trees/40452/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-82.84705352783203, "DegreesDecimalMinutes")).toBe("-082 50.823");
  });
  it("-82.07109832763672 -> \"-082 04.266\" (Trees/165807/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-82.07109832763672, "DegreesDecimalMinutes")).toBe("-082 04.266");
  });
  it("-81.50601959228516 -> \"-081 30.361\" (Trees/272780/Details.extracted.json location.coordinatesValue (specified, long))", () => {
    expect(formatLongitude(-81.50601959228516, "DegreesDecimalMinutes")).toBe("-081 30.361");
  });
  it("-80.1372299194336 -> \"-080 08.234\" (Trees/39753/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-80.1372299194336, "DegreesDecimalMinutes")).toBe("-080 08.234");
  });
  it("-79.2415771484375 -> \"-079 14.495\" (Trees/139561/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-79.2415771484375, "DegreesDecimalMinutes")).toBe("-079 14.495");
  });
  it("-77.63909912109375 -> \"-077 38.346\" (Trees/129462/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-77.63909912109375, "DegreesDecimalMinutes")).toBe("-077 38.346");
  });
  it("-76.85459899902344 -> \"-076 51.276\" (Trees/255910/Details.extracted.json location.coordinatesValue (specified, long))", () => {
    expect(formatLongitude(-76.85459899902344, "DegreesDecimalMinutes")).toBe("-076 51.276");
  });
  it("-75.36382293701172 -> \"-075 21.829\" (Trees/142815/Details.extracted.json location.coordinatesValue (specified, long))", () => {
    expect(formatLongitude(-75.36382293701172, "DegreesDecimalMinutes")).toBe("-075 21.829");
  });
  it("-73.92388153076172 -> \"-073 55.433\" (Trees/260046/Details.extracted.json location.coordinatesValue (calculated, long))", () => {
    expect(formatLongitude(-73.92388153076172, "DegreesDecimalMinutes")).toBe("-073 55.433");
  });
});

