-- 회원 아이디를 짧은 형식으로 변경
UPDATE members SET username = 'user00001' WHERE username = 'agent_level_1_user1';
UPDATE members SET username = 'user00002' WHERE username = 'agent_level_2_user1';
UPDATE members SET username = 'user00003' WHERE username = 'agent_level_3_user1';
UPDATE members SET username = 'user00004' WHERE username = 'agent_level_4_user1';
UPDATE members SET username = 'user00005' WHERE username = 'agent_level_5_user1';
UPDATE members SET username = 'user00006' WHERE username = 'agent_level_6_user1';
UPDATE members SET username = 'user00007' WHERE username = 'agent_level_7_user1';
UPDATE members SET username = 'user00008' WHERE username = 'agent_level_8_user1';
UPDATE members SET username = 'user00009' WHERE username = 'agent_level_9_user1';
UPDATE members SET username = 'user00010' WHERE username = 'agent_level_10_user1';
UPDATE members SET username = 'user00011' WHERE username = 'agent_level_11_user1';
UPDATE members SET username = 'user00012' WHERE username = 'agent_level_12_user1';
UPDATE members SET username = 'user00013' WHERE username = 'agent_level_13_user1';
UPDATE members SET username = 'user00014' WHERE username = 'agent_level_14_user1';
UPDATE members SET username = 'user00015' WHERE username = 'agent_level_15_user1';
UPDATE members SET username = 'user00016' WHERE username = 'agent_level_16_user1';
UPDATE members SET username = 'user00017' WHERE username = 'agent_level_17_user1';
UPDATE members SET username = 'user00018' WHERE username = 'agent_level_18_user1';
UPDATE members SET username = 'user00019' WHERE username = 'agent_level_19_user1';
UPDATE members SET username = 'user00020' WHERE username = 'agent_level_20_user1';

-- 추가 회원들도 업데이트
UPDATE members SET username = 'user00021' WHERE username = 'agent_level_2_user2';
UPDATE members SET username = 'user00022' WHERE username = 'agent_level_3_user2';
UPDATE members SET username = 'user00023' WHERE username = 'agent_level_4_user2';
UPDATE members SET username = 'user00024' WHERE username = 'agent_level_5_user2';
UPDATE members SET username = 'user00025' WHERE username = 'agent_level_6_user2';
UPDATE members SET username = 'user00026' WHERE username = 'agent_level_7_user2';
UPDATE members SET username = 'user00027' WHERE username = 'agent_level_8_user2';
UPDATE members SET username = 'user00028' WHERE username = 'agent_level_9_user2';
UPDATE members SET username = 'user00029' WHERE username = 'agent_level_10_user2';

UPDATE members SET username = 'user00030' WHERE username = 'agent_level_3_user3';
UPDATE members SET username = 'user00031' WHERE username = 'agent_level_4_user3';
UPDATE members SET username = 'user00032' WHERE username = 'agent_level_5_user3';
UPDATE members SET username = 'user00033' WHERE username = 'agent_level_6_user3';
UPDATE members SET username = 'user00034' WHERE username = 'agent_level_7_user3';
UPDATE members SET username = 'user00035' WHERE username = 'agent_level_8_user3';
UPDATE members SET username = 'user00036' WHERE username = 'agent_level_9_user3';
UPDATE members SET username = 'user00037' WHERE username = 'agent_level_10_user3';

UPDATE members SET username = 'user00038' WHERE username = 'agent_level_4_user4';
UPDATE members SET username = 'user00039' WHERE username = 'agent_level_5_user4';
UPDATE members SET username = 'user00040' WHERE username = 'agent_level_6_user4';
UPDATE members SET username = 'user00041' WHERE username = 'agent_level_7_user4';
UPDATE members SET username = 'user00042' WHERE username = 'agent_level_8_user4';
UPDATE members SET username = 'user00043' WHERE username = 'agent_level_9_user4';
UPDATE members SET username = 'user00044' WHERE username = 'agent_level_10_user4';

UPDATE members SET username = 'user00045' WHERE username = 'agent_level_5_user5';
UPDATE members SET username = 'user00046' WHERE username = 'agent_level_6_user5';
UPDATE members SET username = 'user00047' WHERE username = 'agent_level_7_user5';
UPDATE members SET username = 'user00048' WHERE username = 'agent_level_8_user5';
UPDATE members SET username = 'user00049' WHERE username = 'agent_level_9_user5';
UPDATE members SET username = 'user00050' WHERE username = 'agent_level_10_user5';

-- 결과 확인
SELECT id, username, nickname, agent_level_id FROM members ORDER BY id;