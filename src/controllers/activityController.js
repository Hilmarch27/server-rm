// controllers/penagihanController.js
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import path from "path";

const prisma = new PrismaClient();

// penagihan
export async function addPenagihan(req, res) {
  try {
    const { jml_ditagih, kolektibitas, debiturId } = req.body;

    // Mendapatkan ID pengguna dari objek req
    const userId = req.user.id_rm;

    // Lakukan sesuatu dengan userId...

    console.log(userId); // Contoh: mencetak ID pengguna

    // Menambahkan data penagihan ke dalam database
    const newPenagihan = await prisma.penagihan.create({
      data: {
        jml_ditagih,
        kolektibitas,
        debitur: {
          connect: {
            id_debitur: debiturId,
          },
        },
        user: {
          connect: {
            id_rm: userId,
          },
        },
      },
    });

    res.status(201).json({
      message: "Data Penagihan berhasil ditambahkan",
      data: newPenagihan,
    });

    console.log(chalk.green("Data penagihan ditambahkan"));
  } catch (error) {
    console.error("Error adding Penagihan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// add pemberkasan
export async function addPemberkasan(req, res) {
  try {
    const {
      tgl_act,
      no_shm,
      npwp,
      nl,
      alm_shm,
      pic,
      tgl_target,
      progres,
      bln_lelang,
      tgl_lelang,
      no_laku_lelang,
      limit_lelang,
      info_lelang,
      tgl_up_info_lelang,
      lokasi_nasabah,
      alamat_nasabah,
      tgl_ots,
      rm_ots,
      agunan,
      pemasaran_jaminan,
      debiturId,
    } = req.body;

    const files = req.files;

    const userId = req.user.id_rm;

    console.log("Received request to add Pemberkasan with data:", req.body);
    console.log("Received files:", files);
    console.log("User ID:", userId);
    const getFileName = (filePath) => path.basename(filePath);

    const newPemberkasan = await prisma.pemberkasan.create({
      data: {
        tgl_act,
        no_shm: no_shm ? parseInt(no_shm) : null,
        npwp: npwp ? parseInt(npwp) : null,
        nl,
        alm_shm,
        pic,
        tgl_target,
        progres,
        bln_lelang,
        tgl_lelang,
        no_laku_lelang: no_laku_lelang ? parseInt(no_laku_lelang) : null,
        limit_lelang,
        info_lelang,
        tgl_up_info_lelang,
        lokasi_nasabah,
        alamat_nasabah,
        foto_depan: files.foto_depan
          ? getFileName(files.foto_depan[0].path)
          : "",
        foto_kiri: files.foto_kiri ? getFileName(files.foto_kiri[0].path) : "",
        foto_kanan: files.foto_kanan
          ? getFileName(files.foto_kanan[0].path)
          : "",
        foto_dalam_rumah1: files.foto_dalam_rumah1
          ? getFileName(files.foto_dalam_rumah1[0].path)
          : "",
        foto_dalam_rumah2: files.foto_dalam_rumah2
          ? getFileName(files.foto_dalam_rumah2[0].path)
          : "",
        foto_dalam_rumah3: files.foto_dalam_rumah3
          ? getFileName(files.foto_dalam_rumah3[0].path)
          : "",
        tgl_ots,
        rm_ots,
        agunan,
        pemasaran_jaminan,
        debitur: {
          connect: {
            id_debitur: debiturId,
          },
        },
        user: {
          connect: {
            id_rm: userId,
          },
        },
      },
    });

    console.log("New Pemberkasan added:", newPemberkasan);

    res.json(newPemberkasan);
  } catch (error) {
    console.error(`Error in addPemberkasan: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// ? edit data activity
export const updatePenagihan = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updatedPenagihan = await prisma.penagihan.update({
      where: { id_penagihan: id },
      data: updateData,
    });
    res.status(200).json(updatedPenagihan);
  } catch (error) {
    res.status(500).json({ error: "Failed to update Penagihan" });
  }
};

export const updatePemberkasan = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  if (req.files) {
    const files = req.files;
    if (files.foto_depan) updateData.foto_depan = files.foto_depan[0].path;
    if (files.foto_kiri) updateData.foto_kiri = files.foto_kiri[0].path;
    if (files.foto_kanan) updateData.foto_kanan = files.foto_kanan[0].path;
    if (files.foto_dalam_rumah1)
      updateData.foto_dalam_rumah1 = files.foto_dalam_rumah1[0].path;
    if (files.foto_dalam_rumah2)
      updateData.foto_dalam_rumah2 = files.foto_dalam_rumah2[0].path;
    if (files.foto_dalam_rumah3)
      updateData.foto_dalam_rumah3 = files.foto_dalam_rumah3[0].path;
  }
  try {
    const updatedPemberkasan = await prisma.pemberkasan.update({
      where: { id_pemberkasan: id },
      data: updateData,
    });
    console.log(`Pemberkasan with ID ${id} updated successfully`);
    res.status(200).json(updatedPemberkasan);
  } catch (error) {
    console.error(`Error updating Pemberkasan with ID ${id}:`, error);
    res.status(500).json({ error: "Failed to update Pemberkasan" });
  }
};




// ? get data activity
export const getActivity = async (req, res) => {
  try {
    const { nama } = req.params;
    console.log(`Requested activity name: ${nama}`); // Log nama activity yang diminta
    if (nama === "Penagihan") {
      try {
        const penagihanData = await prisma.penagihan.findMany({
          include: {
            debitur: true, // Include data debitur
            user: true,
          },
        });
        console.log(`Retrieved data: ${JSON.stringify(penagihanData)}`); // Log data yang diambil
        res.status(200).json(
          penagihanData.map((item) => ({
            nama: item.user ? item.user.nama : null,
            nama_debitur: item.debitur ? item.debitur.nama_debitur : null, // Menampilkan nama debitur
            kode_uker: item.debitur ? item.debitur.kode_uker : null,
            id_penagihan: item.id_penagihan,
            jml_ditagih: item.jml_ditagih,
            kolektibitas: item.kolektibitas,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }))
        );
      } catch (error) {
        console.error(chalk.red("Error retrieving Penagihan data:", error));
        res.status(500).json({ message: "Internal server error" });
      }
    } else if (nama === "Pemberkasan") {
      try {
        const pemberkasanData = await prisma.pemberkasan.findMany({
          include: {
            debitur: true,
            user: true,
          },
        });

        console.log(`Retrieved ${pemberkasanData.length} pemberkasan records`);
        res.status(200).json(
          pemberkasanData.map((item) => ({
            id_pemberkasan: item.id_pemberkasan,
            nama_debitur: item.debiturId ? item.debiturId.nama_debitur : null,
            nama_user: item.user ? item.user.nama : null,
            tgl_act: item.tgl_act,
            no_shm: item.no_shm,
            npwp: item.npwp,
            nl: item.nl,
            alm_shm: item.alm_shm,
            pic: item.pic,
            tgl_target: item.tgl_target,
            progres: item.progres,
            bln_lelang: item.bln_lelang,
            tgl_lelang: item.tgl_lelang,
            no_laku_lelang: item.no_laku_lelang,
            limit_lelang: item.limit_lelang,
            info_lelang: item.info_lelang,
            tgl_up_info_lelang: item.tgl_up_info_lelang,
            lokasi_nasabah: item.lokasi_nasabah,
            alamat_nasabah: item.alamat_nasabah,
            tgl_ots: item.tgl_ots,
            rm_ots: item.rm_ots,
            agunan: item.agunan,
            pemasaran_jaminan: item.pemasaran_jaminan,
            foto_depan: item.foto_depan,
            foto_kiri: item.foto_kiri,
            foto_kanan: item.foto_kanan,
            foto_dalam_rumah1: item.foto_dalam_rumah1,
            foto_dalam_rumah2: item.foto_dalam_rumah2,
            foto_dalam_rumah3: item.foto_dalam_rumah3,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }))
        );
      } catch (error) {
        console.error(chalk.red("Error retrieving Pemberkasan data:", error));
        res.status(500).json({ message: "Internal server error" });
      }
    } else {
      res.status(404).json({ message: "Activity not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
