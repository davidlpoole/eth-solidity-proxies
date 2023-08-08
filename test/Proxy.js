const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { assert } = require("chai");

describe("Proxy", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        const Proxy = await ethers.getContractFactory("Proxy");
        const proxy = await Proxy.deploy();

        const Logic1 = await ethers.getContractFactory("Logic1");
        const logic1 = await Logic1.deploy();

        const Logic2 = await ethers.getContractFactory("Logic2");
        const logic2 = await Logic2.deploy();

        const proxyAsLogic1 = await ethers.getContractAt("Logic1", proxy.target)
        const proxyAsLogic2 = await ethers.getContractAt("Logic2", proxy.target)

        return {proxy, proxyAsLogic1, proxyAsLogic2, logic1, logic2};
    }

    async function lookupUint(contractAddr, slot) {
        return parseInt(await ethers.provider.getStorage(contractAddr, slot));
    }

    it("Should work with logic1", async function () {
        const { proxy, proxyAsLogic1, logic1 } = await loadFixture(deployFixture);

        await proxy.changeImplementation(logic1.target);

        assert.equal(await lookupUint(logic1.target, "0x00"), 0);

        await proxyAsLogic1.changeX(52);

        assert.equal(await lookupUint(logic1.target, "0x00"), 52);
    });

    it("Should work with upgrades", async function () {
        const { proxy, logic1, logic2, proxyAsLogic1, proxyAsLogic2 } = await loadFixture(deployFixture);

        await proxy.changeImplementation(logic1.target);
        assert.equal(await lookupUint(logic1.target, "0x00"), 0);

        await proxyAsLogic1.changeX(45);
        assert.equal(await lookupUint(logic1.target, "0x00"), 45);

        await proxy.changeImplementation(logic2.target);
        assert.equal(await lookupUint(logic2.target, "0x00"), 0);

        await proxyAsLogic2.changeX(25);
        assert.equal(await lookupUint(logic2.target, "0x00"), 25);

        await proxyAsLogic2.tripleX();
        assert.equal(await lookupUint(logic2.target, "0x00"), 75);
    });
});
